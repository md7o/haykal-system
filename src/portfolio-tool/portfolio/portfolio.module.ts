import { Module } from '@nestjs/common';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from './entities/portfolio.entity';
import { Page } from '../pages/entities/page.entity';
import { Section } from '../sections/entities/section.entity';
import { Asset } from '../assets/entities/asset.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { AssetsModule } from '../assets/assets.module';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio, Page, Section, Asset]), AssetsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
