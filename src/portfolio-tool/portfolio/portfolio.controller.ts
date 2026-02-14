import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, HttpCode, Patch } from '@nestjs/common';
import { Portfolio } from './entities/portfolio.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { PortfolioService } from './portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Body() dto: CreatePortfolioDto): Promise<Portfolio> {
    return this.portfolioService.createPortfolio(dto.userId, dto.slug);
  }

  @Get()
  findAll(): Promise<Portfolio[]> {
    return this.portfolioService.findAllPortfolio();
  }

  @Get('user/:userId')
  findByUserId(@Param('userId') userId: string): Promise<Portfolio> {
    return this.portfolioService.findByUserId(userId);
  }

  @Get(':identifier')
  findByIdOrSlug(@Param('identifier') identifier: string): Promise<Portfolio> {
    return this.portfolioService.findByIdOrSlug(identifier);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  updateSlug(@Param('id') id: string, @Body() dto: UpdatePortfolioDto): Promise<Portfolio> {
    return this.portfolioService.updatePortfolio(id, dto.slug);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string): Promise<void> {
    return this.portfolioService.deletePortfolio(id);
  }
}
