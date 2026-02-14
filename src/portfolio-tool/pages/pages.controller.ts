import { Controller, Get, Post, Body, Patch, Param, Delete, Put, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import { PagesService } from './pages.service';
import { CreatePageDto } from './dto/create-page.dto';
import { UpdatePageDto } from './dto/update-page.dto';
import { ReorderPagesDto } from './dto/reorder-pages.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';

@Controller()
@UseGuards(JwtAuthGuard)
export class PagesController {
  constructor(private readonly pagesService: PagesService) {}

  @Get(':id/pages')
  findAll(@Param('id', ParseUUIDPipe) portfolioId: string) {
    return this.pagesService.findAll(portfolioId);
  }

  @Get(':id/pages/:pageId')
  findOne(@Param('id', ParseUUIDPipe) portfolioId: string, @Param('pageId', ParseUUIDPipe) pageId: string) {
    return this.pagesService.findOne(pageId, portfolioId);
  }

  @Post(':id/pages')
  create(@Param('id', ParseUUIDPipe) portfolioId: string, @Body() createPageDto: CreatePageDto) {
    return this.pagesService.create(portfolioId, createPageDto);
  }

  @Put(':id/pages/reorder')
  reorder(@Param('id', ParseUUIDPipe) portfolioId: string, @Body() reorderPagesDto: ReorderPagesDto) {
    return this.pagesService.reorder(portfolioId, reorderPagesDto.pageIds);
  }

  @Patch(':id/pages/:pageId')
  update(
    @Param('id', ParseUUIDPipe) portfolioId: string,
    @Param('pageId', ParseUUIDPipe) pageId: string,
    @Body() updatePageDto: UpdatePageDto,
  ) {
    return this.pagesService.update(pageId, portfolioId, updatePageDto);
  }

  @Delete(':id/pages/:pageId')
  remove(@Param('id', ParseUUIDPipe) portfolioId: string, @Param('pageId', ParseUUIDPipe) pageId: string) {
    return this.pagesService.remove(pageId, portfolioId);
  }
}
