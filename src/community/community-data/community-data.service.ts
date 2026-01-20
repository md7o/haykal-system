import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CommunityData } from './entities/community-data.entity';
import { CreateCommunityDataDto } from './dto/create-community-data.dto';
import { UpdateCommunityDataDto } from './dto/update-community-data.dto';

@Injectable()
export class CommunityDataService {
  constructor(
    @InjectRepository(CommunityData)
    private readonly communityDataRepository: Repository<CommunityData>,
  ) {}

  create(createCommunityDataDto: CreateCommunityDataDto) {
    const communityData = this.communityDataRepository.create({
      ...createCommunityDataDto,
      // let the entity default the type if not provided
      type: createCommunityDataDto.type ?? undefined,
    });
    return this.communityDataRepository.save(communityData);
  }

  findAll() {
    return this.communityDataRepository.find();
  }

  async findOne(id: string) {
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return this.findOneBySlug(id);
    }

    const communityData = await this.communityDataRepository.findOne({ where: { id } });
    if (!communityData) {
      throw new NotFoundException(`CommunityData with ID ${id} not found`);
    }
    return communityData;
  }

  async findOneBySlug(slug: string) {
    const communityData = await this.communityDataRepository.findOne({ where: { slug } });
    if (!communityData) {
      throw new NotFoundException(`CommunityData with slug ${slug} not found`);
    }
    return communityData;
  }

  async update(id: string, updateCommunityDataDto: UpdateCommunityDataDto) {
    const communityData = await this.findOne(id);

    // Check if slug is being changed and validate 30-day cooldown
    if (updateCommunityDataDto.slug && updateCommunityDataDto.slug !== communityData.slug) {
      this.validateSlugChangeAllowed(communityData);
      // Update lastSlugChangeAt to now when slug changes
      communityData.lastSlugChangeAt = new Date();
    }

    Object.assign(communityData, updateCommunityDataDto);
    return this.communityDataRepository.save(communityData);
  }

  private validateSlugChangeAllowed(communityData: CommunityData) {
    if (!communityData.lastSlugChangeAt) {
      // First time changing slug, always allowed
      return;
    }

    const now = new Date();
    // const thirtyDaysInMs = 30 * 24 * 60 * 60 * 1000;
    const thirtyDaysInMs = 1;
    const timeSinceLastChange = now.getTime() - new Date(communityData.lastSlugChangeAt).getTime();

    if (timeSinceLastChange < thirtyDaysInMs) {
      const nextChangeDate = new Date(new Date(communityData.lastSlugChangeAt).getTime() + thirtyDaysInMs);
      throw new BadRequestException(
        `Slug can only be changed once every 30 days. Next change allowed on ${nextChangeDate.toISOString()}`,
      );
    }
  }

  async remove(id: string) {
    const communityData = await this.findOne(id);
    return this.communityDataRepository.remove(communityData);
  }
}
