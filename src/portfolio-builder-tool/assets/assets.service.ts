import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Asset } from './entities/asset.entity';

@Injectable()
export class AssetsService {
  constructor(
    @InjectRepository(Asset)
    private assetRepository: Repository<Asset>,
  ) {}

  async create(userId: string, file: Express.Multer.File): Promise<Asset> {
    const asset = this.assetRepository.create({
      userId,
      filename: file.filename,
      path: file.path,
      mimetype: file.mimetype,
      size: file.size,
    });
    return this.assetRepository.save(asset);
  }

  async findAll(userId: string): Promise<Asset[]> {
    return this.assetRepository.find({ where: { userId }, order: { createdAt: 'DESC' } });
  }
}
