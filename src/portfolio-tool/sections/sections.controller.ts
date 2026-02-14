import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { BatchCreateSectionsDto } from './dto/batch-create-sections.dto';
import { BatchDeleteSectionsDto } from './dto/batch-delete-sections.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get(':id/sections')
  findAll(@Param('id', ParseUUIDPipe) pageId: string) {
    return this.sectionsService.findAll(pageId);
  }

  @Get(':id/sections/:sectionId')
  findOne(@Param('sectionId', ParseUUIDPipe) id: string) {
    return this.sectionsService.findOne(id);
  }

  @Post(':id/sections')
  create(@Param('id', ParseUUIDPipe) pageId: string, @Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(pageId, createSectionDto);
  }

  @Post(':id/sections/batch')
  batchCreate(@Param('id', ParseUUIDPipe) pageId: string, @Body() batchCreateSectionsDto: BatchCreateSectionsDto) {
    return this.sectionsService.batchCreate(pageId, batchCreateSectionsDto.sections);
  }

  @Put(':id/sections/reorder')
  reorder(@Param('id', ParseUUIDPipe) pageId: string, @Body() reorderSectionsDto: ReorderSectionsDto) {
    return this.sectionsService.reorder(pageId, reorderSectionsDto.sectionIds);
  }

  @Patch(':id/sections/:sectionId')
  update(@Param('sectionId', ParseUUIDPipe) id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete(':id/sections/:sectionId')
  remove(@Param('sectionId', ParseUUIDPipe) id: string) {
    return this.sectionsService.remove(id);
  }

  @Post(':id/sections/batch-delete')
  batchDelete(@Param('id', ParseUUIDPipe) pageId: string, @Body() batchDeleteSectionsDto: BatchDeleteSectionsDto) {
    return this.sectionsService.batchDelete(pageId, batchDeleteSectionsDto.sectionIds);
  }
}
