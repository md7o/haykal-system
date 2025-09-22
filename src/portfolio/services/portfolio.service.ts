import { Injectable } from '@nestjs/common';
import { CreatePortfolioDto } from '../dto/create-portfolio.dto';
import { UpdatePortfolioDto } from '../dto/update-portfolio.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Portfolio } from '../entities/portfolio.entity';

@Injectable()
export class PortfolioService {
  constructor(
    @InjectRepository(Portfolio)
    private portfolioRepository: Repository<Portfolio>,
  ) {}

  create(createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
    const portfolio = this.portfolioRepository.create(createPortfolioDto);
    return this.portfolioRepository.save(portfolio);
  }

  findAll(): Promise<Portfolio[]> {
    return this.portfolioRepository.find();
  }

  async findOneById(id: string): Promise<Portfolio | null> {
    return await this.portfolioRepository.findOneBy({ id });
  }

  update(id: string, updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfolioRepository.update(id, updatePortfolioDto);
  }

  remove(id: string) {
    return this.portfolioRepository.delete(id);
  }
}
