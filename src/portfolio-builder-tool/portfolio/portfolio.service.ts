import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DeepPartial, UpdateResult, DataSource, In } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { generateSlug } from 'src/common/utils/slug.helper';
import { BulkSavePortfolioDto } from './dto/bulk-save-portfolio.dto';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
    private dataSource: DataSource,
  ) {}

  async create(userId: string, createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
    let slug = createPortfolioDto.slug;
    if (slug) {
      slug = generateSlug(slug);
      const isUnique = await this.isSlugUniqueForUser(userId, slug);
      if (!isUnique) throw new ConflictException('Slug already in use for this user');
    }

    // Prevent creating more than one portfolio per user (DB has unique constraint)
    const existingForUser = await this.portfolioRepository.findOne({ where: { userId } });
    if (existingForUser) {
      throw new ConflictException('User already has a portfolio');
    }

    const data: Partial<Portfolio> = {
      userId,
      slug: slug ?? null,
      assets: createPortfolioDto.assets ?? null,
    };

    const portfolio = this.portfolioRepository.create(data as DeepPartial<Portfolio>);
    return this.portfolioRepository.save(portfolio as DeepPartial<Portfolio>);
  }

  async isSlugUniqueForUser(userId: string, slug: string, excludeId?: string): Promise<boolean> {
    const qb = this.portfolioRepository
      .createQueryBuilder('p')
      .where('p.user_id = :userId', { userId })
      .andWhere('p.slug = :slug', { slug });
    if (excludeId) {
      qb.andWhere('p.id != :excludeId', { excludeId });
    }
    const count = await qb.getCount();
    return count === 0;
  }

  findAllByUser(userId: string): Promise<Portfolio[]> {
    return this.portfolioRepository.find({ where: { userId } });
  }

  async findOneByIdForUser(userId: string, id: string): Promise<Portfolio | null> {
    return await this.portfolioRepository.findOne({ where: { id, userId }, relations: ['pages'] });
  }

  async findOneBySlugForUser(userId: string, slug: string): Promise<Portfolio | null> {
    return await this.portfolioRepository.findOne({ where: { slug, userId }, relations: ['pages'] });
  }

  async findFullPortfolio(userId: string, id: string): Promise<Portfolio | null> {
    return await this.portfolioRepository
      .createQueryBuilder('portfolio')
      .leftJoinAndSelect('portfolio.pages', 'page')
      .leftJoinAndSelect('page.sections', 'section')
      .where('portfolio.id = :id', { id })
      .andWhere('portfolio.userId = :userId', { userId })
      .orderBy('page.order', 'ASC')
      .addOrderBy('section.order', 'ASC')
      .getOne();
  }

  async update(id: string, userId: string, updatePortfolioDto: UpdatePortfolioDto): Promise<Portfolio> {
    if (updatePortfolioDto.slug) {
      const isUnique = await this.isSlugUniqueForUser(userId, updatePortfolioDto.slug as string, id);
      if (!isUnique) throw new ConflictException('Slug already in use for this user');
    }

    const updateData: Partial<Pick<Portfolio, 'slug' | 'assets' | 'status'>> = {};
    if ('slug' in updatePortfolioDto) updateData.slug = (updatePortfolioDto as any).slug ?? null;
    if ('assets' in updatePortfolioDto) updateData.assets = updatePortfolioDto.assets ?? null;
    if ('status' in updatePortfolioDto) updateData.status = updatePortfolioDto.status;

    if (Object.keys(updateData).length > 0) {
      await this.portfolioRepository.update({ id, userId }, updateData);
    }

    const updatedPortfolio = await this.findOneByIdForUser(userId, id);
    if (!updatedPortfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return updatedPortfolio;
  }

  async remove(id: string, userId?: string) {
    if (userId) {
      // ensure we only delete portfolios that belong to the user
      return this.portfolioRepository.delete({ id, userId });
    }
    return this.portfolioRepository.delete(id);
  }

  async saveTree(userId: string, portfolioId: string, dto: BulkSavePortfolioDto): Promise<Portfolio> {
    const portfolio = await this.findOneByIdForUser(userId, portfolioId);
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    return this.dataSource.transaction(async (manager) => {
      // 1. Handle Pages
      const incomingPages = dto.pages;
      const incomingPageIds = incomingPages.map((p) => p.id).filter((id) => id);

      // Delete pages not in incoming list
      const existingPages = await manager.find(Page, { where: { portfolioId } });
      const existingPageIds = existingPages.map((p) => p.id);
      const pagesToDelete = existingPageIds.filter((id) => !incomingPageIds.includes(id));

      if (pagesToDelete.length > 0) {
        await manager.delete(Page, { id: In(pagesToDelete) });
      }

      // Upsert Pages
      for (const pageDto of incomingPages) {
        let savedPage: Page;
        if (pageDto.id) {
          // Update existing
          await manager.update(
            Page,
            { id: pageDto.id },
            {
              title: pageDto.title,
              slug: pageDto.slug,
              order: pageDto.order,
            },
          );
          const foundPage = await manager.findOne(Page, { where: { id: pageDto.id } });
          if (!foundPage) throw new NotFoundException(`Page with ID ${pageDto.id} not found after update`);
          savedPage = foundPage;
        } else {
          // Create new
          const newPage = manager.create(Page, {
            ...pageDto,
            portfolioId,
          });
          savedPage = await manager.save(Page, newPage);
        }

        // 2. Handle Sections for this Page
        const incomingSections = pageDto.sections || [];
        const incomingSectionIds = incomingSections.map((s) => s.id).filter((id) => id);

        // Delete sections not in incoming list (only if page existed)
        if (pageDto.id) {
          const existingSections = await manager.find(Section, { where: { pageId: savedPage.id } });
          const existingSectionIds = existingSections.map((s) => s.id);
          const sectionsToDelete = existingSectionIds.filter((id) => !incomingSectionIds.includes(id));

          if (sectionsToDelete.length > 0) {
            await manager.delete(Section, { id: In(sectionsToDelete) });
          }
        }

        // Upsert Sections
        for (const sectionDto of incomingSections) {
          if (sectionDto.id) {
            await manager.update(
              Section,
              { id: sectionDto.id },
              {
                type: sectionDto.type,
                config: sectionDto.config,
                order: sectionDto.order,
              },
            );
          } else {
            const newSection = manager.create(Section, {
              ...sectionDto,
              pageId: savedPage.id,
            });
            await manager.save(Section, newSection);
          }
        }
      }

      // Update portfolio timestamp and assets
      const updateData: any = { updatedAt: new Date() };
      if (dto.assets !== undefined) {
        updateData.assets = dto.assets;
      }
      await manager.update(Portfolio, { id: portfolioId }, updateData);

      // Return full tree
      const updatedPortfolio = await manager
        .createQueryBuilder(Portfolio, 'portfolio')
        .leftJoinAndSelect('portfolio.pages', 'page')
        .leftJoinAndSelect('page.sections', 'section')
        .where('portfolio.id = :id', { id: portfolioId })
        .orderBy('page.order', 'ASC')
        .addOrderBy('section.order', 'ASC')
        .getOne();

      if (!updatedPortfolio) {
        throw new NotFoundException('Portfolio not found after update');
      }
      return updatedPortfolio;
    });
  }

  async heartbeat(userId: string, portfolioId: string): Promise<void> {
    const result = await this.portfolioRepository.update({ id: portfolioId, userId }, { lastActiveAt: new Date() });
    if (result.affected === 0) {
      throw new NotFoundException('Portfolio not found');
    }
  }
}
