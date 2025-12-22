import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Page } from './entities/page.entity';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { generateSlug } from 'src/common/utils/slug.helper';

@Injectable()
export class PagesService {
  constructor(
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async findAll(portfolioId: string): Promise<Page[]> {
    return this.pageRepository.find({
      where: { portfolioId },
      order: { order: 'ASC' },
    });
  }

  async create(portfolioId: string, createPageDto: CreatePageDto): Promise<Page> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id: portfolioId } });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    const slug = generateSlug(createPageDto.slug || createPageDto.title);

    const existingPage = await this.pageRepository.findOne({
      where: { portfolioId, slug },
    });
    if (existingPage) {
      throw new ConflictException('Page with this slug already exists in the portfolio');
    }

    const count = await this.pageRepository.count({ where: { portfolioId } });

    const page = this.pageRepository.create({
      ...createPageDto,
      slug,
      portfolioId,
      order: count,
    });

    return this.pageRepository.save(page);
  }

  async update(id: string, updatePageDto: UpdatePageDto): Promise<Page> {
    const page = await this.pageRepository.findOne({ where: { id } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (updatePageDto.slug) {
      const slug = generateSlug(updatePageDto.slug);
      if (slug !== page.slug) {
        const existingPage = await this.pageRepository.findOne({
          where: { portfolioId: page.portfolioId, slug },
        });
        if (existingPage) {
          throw new ConflictException('Page with this slug already exists in the portfolio');
        }
        updatePageDto.slug = slug;
      }
    }

    Object.assign(page, updatePageDto);
    return this.pageRepository.save(page);
  }

  async remove(id: string): Promise<void> {
    const result = await this.pageRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Page not found');
    }
  }

  async reorder(portfolioId: string, pageIds: string[]): Promise<void> {
    // Verify all pages belong to the portfolio
    const pages = await this.pageRepository.findByIds(pageIds);
    if (pages.length !== pageIds.length) {
      throw new NotFoundException('One or more pages not found');
    }

    for (const page of pages) {
      if (page.portfolioId !== portfolioId) {
        throw new ConflictException(`Page ${page.id} does not belong to portfolio ${portfolioId}`);
      }
    }

    // Update order
    await this.pageRepository.manager.transaction(async (transactionalEntityManager) => {
      for (let i = 0; i < pageIds.length; i++) {
        await transactionalEntityManager.update(Page, pageIds[i], { order: i });
      }
    });
  }
}
