import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PagesService } from './pages.service';
import { Page } from './entities/page.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { PagesController } from './pages.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Page, Portfolio])],
  controllers: [PagesController],
  providers: [PagesService],
  exports: [PagesService],
})
export class PagesModule {}
