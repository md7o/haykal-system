import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { SectionsService } from './sections.service';
import { CreateSectionDto } from './dto/create-section.dto';
import { UpdateSectionDto } from './dto/update-section.dto';
import { ReorderSectionsDto } from './dto/reorder-sections.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Section } from './entities/section.entity';

@ApiTags('Sections')
@ApiBearerAuth()
@Controller('api')
@UseGuards(JwtAuthGuard)
export class SectionsController {
  constructor(private readonly sectionsService: SectionsService) {}

  @Get('pages/:id/sections')
  @ApiOperation({ summary: 'List sections for a page' })
  @ApiResponse({ status: 200, description: 'Return all sections.', type: [Section] })
  findAll(@Param('id', ParseUUIDPipe) pageId: string) {
    return this.sectionsService.findAll(pageId);
  }

  @Post('pages/:id/sections')
  @ApiOperation({ summary: 'Create a new section' })
  @ApiResponse({ status: 201, description: 'The section has been successfully created.', type: Section })
  create(@Param('id', ParseUUIDPipe) pageId: string, @Body() createSectionDto: CreateSectionDto) {
    return this.sectionsService.create(pageId, createSectionDto);
  }

  @Put('pages/:id/sections/reorder')
  @ApiOperation({ summary: 'Reorder sections' })
  @ApiResponse({ status: 200, description: 'Sections have been reordered.' })
  reorder(@Param('id', ParseUUIDPipe) pageId: string, @Body() reorderSectionsDto: ReorderSectionsDto) {
    return this.sectionsService.reorder(pageId, reorderSectionsDto.sectionIds);
  }

  @Patch('sections/:id')
  @ApiOperation({ summary: 'Update section' })
  @ApiResponse({ status: 200, description: 'The section has been successfully updated.', type: Section })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updateSectionDto: UpdateSectionDto) {
    return this.sectionsService.update(id, updateSectionDto);
  }

  @Delete('sections/:id')
  @ApiOperation({ summary: 'Delete section' })
  @ApiResponse({ status: 200, description: 'The section has been successfully deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.sectionsService.remove(id);
  }
}
