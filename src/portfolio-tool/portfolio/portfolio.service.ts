import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource, In } from 'typeorm';
import { Portfolio } from './entities/portfolio.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async createPortfolio(userId: string, slug: string): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create({
      userId,
      slug,
    });

    if (slug) {
      const slugExists = await this.portfolioRepository.findOne({ where: { slug } });
      if (slugExists) {
        throw new ConflictException('This slug is already taken');
      }
    }

    const saved = await this.portfolioRepository.save(portfolio);

    // Return portfolio with asset attached
    return { ...saved };
  }

  async findByUserId(userId: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { userId },
    });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found for this user');
    }
    return portfolio;
  }

  async findById(id: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { id },
    });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  async findBySlug(slug: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({
      where: { slug },
    });
    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }
    return portfolio;
  }

  async findByIdOrSlug(identifier: string): Promise<Portfolio> {
    // Check if identifier is UUID format
    const isUuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(identifier);

    if (isUuid) {
      return this.findById(identifier);
    } else {
      return this.findBySlug(identifier);
    }
  }

  async findAllPortfolio(): Promise<Portfolio[]> {
    return this.portfolioRepository.find();
  }

  async updatePortfolio(id: string, slug: string): Promise<Portfolio> {
    const portfolio = await this.portfolioRepository.findOne({ where: { id } });

    if (!portfolio) {
      throw new NotFoundException('Portfolio not found');
    }

    if (slug && slug !== portfolio.slug) {
      const slugExists = await this.portfolioRepository.findOne({ where: { slug } });
      if (slugExists) {
        throw new ConflictException('This slug is already taken');
      }
      portfolio.slug = slug;
    }

    return this.portfolioRepository.save(portfolio);
  }

  async deletePortfolio(id: string): Promise<void> {
    const result = await this.portfolioRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Portfolio not found');
    }
  }
}
