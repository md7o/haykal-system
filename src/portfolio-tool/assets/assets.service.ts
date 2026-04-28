import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';
import { Portfolio } from '../portfolio/entities/portfolio.entity';
import { ColorTheme } from '../../common/enums/portfolio-enums/color-theme';
import { FontTheme } from '../../common/enums/portfolio-enums/font-theme';
import { CreateAssetDto } from './dto/create-portfolio-asset.dto';
import { UpdateAssetDto } from './dto/update-portfolio-asset.dto';

@Injectable()
export class AssetsService {
  private readonly logger = new Logger(AssetsService.name);

  constructor(
    @InjectRepository(Asset)
    private readonly assetRepository: Repository<Asset>,
    @InjectRepository(Portfolio)
    private readonly portfolioRepository: Repository<Portfolio>,
  ) {}

  async create(portfolioId: string, createAssetDto: CreateAssetDto): Promise<Asset> {
    this.logger.debug(`Creating asset for portfolio: ${portfolioId}`);

    // Validate portfolio exists
    const portfolio = await this.portfolioRepository.findOne({
      where: { id: portfolioId },
    });

    if (!portfolio) {
      this.logger.warn(`Portfolio not found: ${portfolioId}`);
      throw new NotFoundException(`Portfolio with ID ${portfolioId} not found`);
    }

    // Check if asset already exists for this portfolio (unique constraint)
    const existingAsset = await this.assetRepository.findOne({
      where: { portfolioId },
    });

    if (existingAsset) {
      this.logger.warn(`Asset already exists for portfolio: ${portfolioId}`);
      throw new BadRequestException(`Asset already exists for this portfolio. Use update endpoint to modify.`);
    }

    const asset = this.assetRepository.create({
      portfolioId,
      colorTheme: createAssetDto.colorTheme || ColorTheme.BLUE,
      fontTheme: createAssetDto.fontTheme || FontTheme.CAIRO,
    });

    const saved = await this.assetRepository.save(asset);
    this.logger.log(`Asset created successfully: ${saved.id}`);
    return saved;
  }

  async findByPortfolioId(portfolioId: string): Promise<Asset | null> {
    this.logger.debug(`Fetching asset for portfolio: ${portfolioId}`);

    const asset = await this.assetRepository.findOne({
      where: { portfolioId },
      relations: ['portfolio'],
    });

    return asset;
  }

  async findById(id: string): Promise<Asset | null> {
    this.logger.debug(`Fetching asset: ${id}`);

    const asset = await this.assetRepository.findOne({
      where: { id },
      relations: ['portfolio'],
    });

    return asset;
  }

  async update(id: string, updateAssetDto: UpdateAssetDto): Promise<Asset> {
    this.logger.debug(`Updating asset: ${id}`);

    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      this.logger.warn(`Asset not found: ${id}`);
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    // Update only provided fields
    if (updateAssetDto.colorTheme !== undefined) {
      asset.colorTheme = updateAssetDto.colorTheme;
    }
    if (updateAssetDto.fontTheme !== undefined) {
      asset.fontTheme = updateAssetDto.fontTheme;
    }

    asset.updatedAt = new Date();
    const updated = await this.assetRepository.save(asset);

    this.logger.log(`Asset updated successfully: ${id}`);
    return updated;
  }

  async delete(id: string): Promise<void> {
    this.logger.debug(`Deleting asset: ${id}`);

    const asset = await this.assetRepository.findOne({
      where: { id },
    });

    if (!asset) {
      this.logger.warn(`Asset not found for deletion: ${id}`);
      throw new NotFoundException(`Asset with ID ${id} not found`);
    }

    await this.assetRepository.delete(id);
    this.logger.log(`Asset deleted successfully: ${id}`);
  }

  async findAll(): Promise<Asset[]> {
    this.logger.debug('Fetching all assets');

    const assets = await this.assetRepository.find({
      relations: ['portfolio'],
      order: { createdAt: 'DESC' },
    });

    return assets;
  }
}
