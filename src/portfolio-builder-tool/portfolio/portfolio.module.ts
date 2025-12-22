import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from './entities/portfolio.entity';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioCleanupService } from './portfolio-cleanup.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, Page, Section])],
  controllers: [PortfolioController],
  providers: [PortfolioService, PortfolioCleanupService],
})
export class PortfolioModule {}
