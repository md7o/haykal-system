import { Module } from '@nestjs/common';
import { PortfolioService } from './services/portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from './entities/portfolio.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CustomDesign } from './entities/custom-design.entity';
import { CustomPortfolioService } from './services/custom_portfolio.service';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, CustomDesign])],
  controllers: [PortfolioController],
  providers: [PortfolioService, CustomPortfolioService],
})
export class PortfolioModule {}
