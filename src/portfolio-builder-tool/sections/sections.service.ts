import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Section } from './entities/section.entity';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { Page } from '../pages/entities/page.entity';

@Injectable()
export class SectionsService {
  constructor(
    @InjectRepository(Section)
    private sectionRepository: Repository<Section>,
    @InjectRepository(Page)
    private pageRepository: Repository<Page>,
  ) {}

  async findAll(pageId: string): Promise<Section[]> {
    return this.sectionRepository.find({
      where: { pageId },
      order: { order: 'ASC' },
    });
  }

  async create(pageId: string, createSectionDto: CreateSectionDto): Promise<Section> {
    const page = await this.pageRepository.findOne({ where: { id: pageId } });
    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const count = await this.sectionRepository.count({ where: { pageId } });

    const section = this.sectionRepository.create({
      ...createSectionDto,
      pageId,
      order: count,
    });

    return this.sectionRepository.save(section);
  }

  async update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const section = await this.sectionRepository.findOne({ where: { id } });
    if (!section) {
      throw new NotFoundException('Section not found');
    }

    if (updateSectionDto.config) {
      // Merge config instead of replacing if needed, but proposal says "Update a section's config" with Partial<Config>
      // Assuming simple replacement or merge. Let's do merge at top level or just assign.
      // "config: Partial<Config>" suggests we might want to merge.
      // But for JSONB, usually we replace or use specific json operators.
      // Let's assume replacement of the config object or merge if the user wants deep merge.
      // For now, simple assignment of the provided config object (which might be partial of the full config structure, but here it's just a Record).
      // If the user sends { config: { color: 'red' } } and old was { color: 'blue', size: 'large' },
      // should it become { color: 'red' } or { color: 'red', size: 'large' }?
      // Proposal says "Update a section's config. Payload: { config: Partial<Config> }".
      // I will implement a shallow merge for config.
      section.config = { ...section.config, ...updateSectionDto.config };
    }

    return this.sectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectionRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException('Section not found');
    }
  }

  async reorder(pageId: string, sectionIds: string[]): Promise<void> {
    // Verify all sections belong to the page
    const sections = await this.sectionRepository.findByIds(sectionIds);
    if (sections.length !== sectionIds.length) {
      throw new NotFoundException('One or more sections not found');
    }

    for (const section of sections) {
      if (section.pageId !== pageId) {
        throw new ConflictException(`Section ${section.id} does not belong to page ${pageId}`);
      }
    }

    await this.sectionRepository.manager.transaction(async (transactionalEntityManager) => {
      for (let i = 0; i < sectionIds.length; i++) {
        await transactionalEntityManager.update(Section, sectionIds[i], { order: i });
      }
    });
  }
}
