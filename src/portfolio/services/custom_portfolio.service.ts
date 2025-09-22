import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';
import { Portfolio } from '../entities/portfolio.entity';
import { CustomDesign } from '../entities/custom-design.entity';

@Injectable()
export class CustomPortfolioService {
  constructor(
    @InjectRepository(CustomDesign)
    private customDesignRepository: Repository<CustomDesign>,
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  async create(input: { portfolioId: any; sections?: any; assets?: any }): Promise<CustomDesign> {
    const inputPortfolioId =
      typeof input.portfolioId === 'object' ? (input.portfolioId?.id ?? input.portfolioId) : input.portfolioId;
    const portfolio = await this.portfolioRepository.findOne({ where: { id: inputPortfolioId } });
    if (!portfolio) throw new NotFoundException('Portfolio not found');
    const customDesign = this.customDesignRepository.create({
      portfolioId: portfolio,
      sections: input.sections,
      assets: input.assets,
    });
    try {
      return await this.customDesignRepository.save(customDesign);
    } catch (error) {
      console.error('Failed to save CustomDesign:', error);
      throw error;
    }
  }

  async findAll(): Promise<CustomDesign[]> {
    return this.customDesignRepository.find({ relations: ['portfolioId'] });
  }

  async findOneById(id: string): Promise<CustomDesign | null> {
    return this.customDesignRepository.findOne({
      where: { id },
      relations: ['portfolioId'],
    });
  }

  async update(id: string, payload: { sections?: any; assets?: any }): Promise<CustomDesign | null> {
    const customDesign = await this.customDesignRepository.findOne({ where: { id } });
    if (!customDesign) return null;

    if (payload.sections !== undefined) customDesign.sections = payload.sections;
    if (payload.assets !== undefined) customDesign.assets = payload.assets;

    return this.customDesignRepository.save(customDesign);
  }

  async remove(id: string): Promise<boolean> {
    const result = await this.customDesignRepository.delete({ id });
    return (result.affected ?? 0) > 0;
  }
}
