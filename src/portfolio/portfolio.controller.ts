import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { PortfolioService } from './services/portfolio.service';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { CustomPortfolioService } from './services/custom_portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(
    private readonly portfolioService: PortfolioService,
    private readonly customPortfolioService: CustomPortfolioService,
  ) {}

  // User Portfolio

  @Post()
  create(@Body() createPortfolioDto: CreatePortfolioDto) {
    return this.portfolioService.create(createPortfolioDto);
  }

  @Get()
  findAll() {
    return this.portfolioService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.portfolioService.findOneById(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updatePortfolioDto: UpdatePortfolioDto) {
    return this.portfolioService.update(id, updatePortfolioDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.portfolioService.remove(id);
  }

  // User Custom Portfolio

  @Post('custom')
  customCreate(@Body() body: { portfolioId: string; sections?: any; assets?: any }) {
    return this.customPortfolioService.create({
      portfolioId: body.portfolioId,
      sections: body.sections,
      assets: body.assets,
    });
  }

  @Get('custom')
  customFindAll() {
    return this.customPortfolioService.findAll();
  }

  @Get('custom/:id')
  customFindOne(@Param('id') id: string) {
    return this.customPortfolioService.findOneById(id);
  }

  @Patch('custom/:id')
  customUpdate(@Param('id') id: string, @Body() body: { sections?: any; assets?: any }) {
    return this.customPortfolioService.update(id, {
      sections: body.sections,
      assets: body.assets,
    });
  }

  @Delete('custom/:id')
  customRemove(@Param('id') id: string) {
    return this.customPortfolioService.remove(id);
  }
}
