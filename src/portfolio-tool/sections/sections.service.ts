import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
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
      order: { createdAt: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Section | null> {
    return this.sectionRepository.findOne({ where: { id } });
  }

  async create(pageId: string, createSectionDto: CreateSectionDto): Promise<Section> {
    const page = await this.pageRepository.findOne({ where: { id: pageId } });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const section = this.sectionRepository.create({
      pageId,
      type: createSectionDto.type,
      config: createSectionDto.config ?? {},
    });

    return this.sectionRepository.save(section);
  }

  async batchCreate(pageId: string, sections: Array<{ type: any; config?: Record<string, any> }>): Promise<Section[]> {
    const page = await this.pageRepository.findOne({ where: { id: pageId } });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    const newSections = sections.map((section) =>
      this.sectionRepository.create({
        pageId,
        type: section.type,
        config: section.config ?? {},
      }),
    );

    return this.sectionRepository.save(newSections);
  }

  async update(id: string, updateSectionDto: UpdateSectionDto): Promise<Section> {
    const section = await this.sectionRepository.findOne({ where: { id } });

    if (!section) {
      throw new NotFoundException('Section not found');
    }

    // Merge content and style instead of replacing
    if (updateSectionDto.config) {
      section.config = { ...section.config, ...updateSectionDto.config };
    }
    if (updateSectionDto.type !== undefined) {
      section.type = updateSectionDto.type;
    }

    return this.sectionRepository.save(section);
  }

  async remove(id: string): Promise<void> {
    const result = await this.sectionRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException('Section not found');
    }
  }

  async batchDelete(pageId: string, sectionIds: string[]): Promise<{ deleted: number }> {
    const page = await this.pageRepository.findOne({ where: { id: pageId } });

    if (!page) {
      throw new NotFoundException('Page not found');
    }

    if (sectionIds.length === 0) {
      throw new NotFoundException('No section IDs provided');
    }

    const sections = await this.sectionRepository.findBy({ id: In(sectionIds) });
    if (sections.length !== sectionIds.length) {
      throw new NotFoundException('One or more sections not found');
    }

    for (const section of sections) {
      if (section.pageId !== pageId) {
        throw new ConflictException(`Section ${section.id} does not belong to page ${pageId}`);
      }
    }

    const result = await this.sectionRepository.delete({ id: In(sectionIds) });

    return { deleted: result.affected ?? 0 };
  }

  async reorder(pageId: string, sectionIds: string[]): Promise<void> {
    const sections = await this.sectionRepository.findBy({ id: In(sectionIds) });
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
