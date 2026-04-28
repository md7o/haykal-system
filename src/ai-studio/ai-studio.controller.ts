import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Request } from '@nestjs/common';
import { AiStudioService } from './ai-studio.service';
import { CreateAiStudioDto } from './dto/create-ai-studio.dto';
import { JwtAuthGuard } from '../auth/guards/auth.guard';
import type { AuthenticatedRequest } from '../common/interfaces/authenticated-request.interface';
import { Idea } from './entities/idea.entity';
import { UpdateAiStudioDto } from './dto/update-ai-studio.dto';

@Controller('ai-studio')
export class AiStudioController {
  constructor(private readonly aiStudioService: AiStudioService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateAiStudioDto, @Request() req: AuthenticatedRequest) {
    return this.aiStudioService.create(createDto, req.user.userId);
  }

  @Get()
  findAll() {
    return this.aiStudioService.findAll();
  }

  @Get('user-ideas/:userId')
  getAllByUserId(@Param('userId') userId: string): Promise<Idea[]> {
    return this.aiStudioService.findAllByUserId(userId);
  }

  @Get('user/:userId')
  getByUserId(@Param('userId') userId: string): Promise<Idea> {
    return this.aiStudioService.findOneByUserId(userId);
  }

  @Get(':id')
  findOne(@Param('id') id: string): Promise<Idea> {
    return this.aiStudioService.findOne(id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateDto: UpdateAiStudioDto) {
    return this.aiStudioService.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.aiStudioService.remove(id);
  }
}
