import { Body, Controller, Delete, Get, Param, Post, UseGuards, HttpCode, Patch } from '@nestjs/common';
import { AssetsService } from './assets.service';
import { Asset } from './entities/asset.entity';
import { CreateAssetDto } from './dto/create-portfolio-asset.dto';
import { UpdateAssetDto } from './dto/update-portfolio-asset.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller('assets')
export class AssetsController {
  constructor(private readonly assetsService: AssetsService) {}

  @Post(':portfolioId')
  @HttpCode(201)
  @UseGuards(JwtAuthGuard)
  create(@Param('portfolioId') portfolioId: string, @Body() createAssetDto: CreateAssetDto): Promise<Asset> {
    return this.assetsService.create(portfolioId, createAssetDto);
  }

  @Get('portfolio/:portfolioId')
  findByPortfolio(@Param('portfolioId') portfolioId: string): Promise<Asset | null> {
    return this.assetsService.findByPortfolioId(portfolioId);
  }

  @Get(':id')
  findById(@Param('id') id: string): Promise<Asset | null> {
    return this.assetsService.findById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(@Param('id') id: string, @Body() updateAssetDto: UpdateAssetDto): Promise<Asset> {
    return this.assetsService.update(id, updateAssetDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  delete(@Param('id') id: string): Promise<void> {
    return this.assetsService.delete(id);
  }

  // @Patch(':id/reorder')
  // reorder(@Param('portfolioId') portfolioId: string, @Body() reorderAssetsDto: ReorderAssetsDto): Promise<Asset[]> {
  //   return this.assetsService.reorder(portfolioId, reorderAssetsDto.orders);
  // }
}
