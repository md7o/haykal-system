import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { CommunityDataService } from './community-data.service';
import { CreateCommunityDataDto } from './dto/create-community-data.dto';
import { UpdateCommunityDataDto } from './dto/update-community-data.dto';

@Controller('community-data')
export class CommunityDataController {
  constructor(private readonly communityDataService: CommunityDataService) {}

  @Post()
  create(@Body() createCommunityDataDto: CreateCommunityDataDto) {
    return this.communityDataService.create(createCommunityDataDto);
  }

  @Get()
  findAll() {
    return this.communityDataService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.communityDataService.findOne(id);
  }

  @Get('slug/:slug')
  findOneBySlug(@Param('slug') slug: string) {
    return this.communityDataService.findOneBySlug(slug);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateCommunityDataDto: UpdateCommunityDataDto) {
    return this.communityDataService.update(id, updateCommunityDataDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.communityDataService.remove(id);
  }
}
