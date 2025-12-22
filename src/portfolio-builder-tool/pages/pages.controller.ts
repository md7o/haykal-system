import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ReorderPagesDto } from './dto/reorder-pages.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Page } from './entities/page.entity';

@ApiTags('Pages')
@ApiBearerAuth()
@Controller('api')
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get('portfolios/:id/pages')
  @ApiOperation({ summary: 'List pages for a portfolio' })
  @ApiResponse({ status: 200, description: 'Return all pages.', type: [Page] })
  findAll(@Param('id', ParseUUIDPipe) portfolioId: string) {
    return this.pagesService.findAll(portfolioId);
  }

  @Post('portfolios/:id/pages')
  @ApiOperation({ summary: 'Create a new page' })
  @ApiResponse({ status: 201, description: 'The page has been successfully created.', type: Page })
  create(@Param('id', ParseUUIDPipe) portfolioId: string, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(portfolioId, createPageDto);
  }

  @Put('portfolios/:id/pages/reorder')
  @ApiOperation({ summary: 'Reorder pages' })
  @ApiResponse({ status: 200, description: 'Pages have been reordered.' })
  reorder(@Param('id', ParseUUIDPipe) portfolioId: string, @Body() reorderPagesDto: ReorderPagesDto) {
    return this.pagesService.reorder(portfolioId, reorderPagesDto.pageIds);
  }

  @Patch('pages/:id')
  @ApiOperation({ summary: 'Update page' })
  @ApiResponse({ status: 200, description: 'The page has been successfully updated.', type: Page })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() updatePageDto: UpdatePageDto) {
    return this.pagesService.update(id, updatePageDto);
  }

  @Delete('pages/:id')
  @ApiOperation({ summary: 'Delete page' })
  @ApiResponse({ status: 200, description: 'The page has been successfully deleted.' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.pagesService.remove(id);
  }
}
