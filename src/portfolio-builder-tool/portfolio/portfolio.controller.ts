import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Req,
  UseGuards,
  HttpCode,
} from '@nestjs/common';
import { DeleteResult, UpdateResult } from 'typeorm';
import { CreatePortfolioDto } from './dto/create-portfolio.dto';
import { UpdatePortfolioDto } from './dto/update-portfolio.dto';
import { BulkSavePortfolioDto } from './dto/bulk-save-portfolio.dto';
import { Portfolio } from './entities/portfolio.entity';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('Portfolio')
@ApiBearerAuth()
@Controller('portfolio')
@UseGuards(JwtAuthGuard)
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new portfolio' })
  @ApiResponse({ status: 201, description: 'The portfolio has been successfully created.', type: Portfolio })
  create(@Req() req: any, @Body() createPortfolioDto: CreatePortfolioDto): Promise<Portfolio> {
    const userId: string = req.user?.userId;
    return this.portfolioService.create(userId, createPortfolioDto);
  }

  @Post(':id/save')
  @HttpCode(200)
  @ApiOperation({ summary: 'Bulk save portfolio tree (pages and sections)' })
  @ApiResponse({ status: 200, description: 'The portfolio tree has been successfully saved.', type: Portfolio })
  saveTree(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() bulkSaveDto: BulkSavePortfolioDto,
  ): Promise<Portfolio> {
    const userId: string = req.user?.userId;
    return this.portfolioService.saveTree(userId, id, bulkSaveDto);
  }

  @Post(':id/heartbeat')
  @HttpCode(200)
  @ApiOperation({ summary: 'Update portfolio last active timestamp' })
  @ApiResponse({ status: 200, description: 'Heartbeat received.' })
  heartbeat(@Req() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<void> {
    const userId: string = req.user?.userId;
    return this.portfolioService.heartbeat(userId, id);
  }

  @Get()
  @ApiOperation({ summary: 'List user portfolios' })
  @ApiResponse({ status: 200, description: 'Return all portfolios for the user.', type: [Portfolio] })
  findAll(@Req() req: any): Promise<Portfolio[]> {
    const userId: string = req.user?.userId;
    return this.portfolioService.findAllByUser(userId);
  }

  @Get(':id/full')
  @ApiOperation({ summary: 'Get full portfolio tree' })
  @ApiResponse({ status: 200, description: 'Return the full portfolio tree.', type: Portfolio })
  findFullPortfolio(@Req() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<Portfolio | null> {
    const userId: string = req.user?.userId;
    return this.portfolioService.findFullPortfolio(userId, id);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get portfolio by ID' })
  @ApiResponse({ status: 200, description: 'Return the portfolio.', type: Portfolio })
  findOneById(@Req() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<Portfolio | null> {
    const userId: string = req.user?.userId;
    return this.portfolioService.findOneByIdForUser(userId, id);
  }

  @Get('slug/:slug')
  @ApiOperation({ summary: 'Get portfolio by slug' })
  @ApiResponse({ status: 200, description: 'Return the portfolio.', type: Portfolio })
  findOneBySlug(@Req() req: any, @Param('slug') slug: string): Promise<Portfolio | null> {
    const userId: string = req.user?.userId;
    return this.portfolioService.findOneBySlugForUser(userId, slug);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update portfolio' })
  @ApiResponse({ status: 200, description: 'The portfolio has been successfully updated.', type: Portfolio })
  update(
    @Req() req: any,
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updatePortfolioDto: UpdatePortfolioDto,
  ): Promise<Portfolio> {
    const userId: string = req.user?.userId;
    return this.portfolioService.update(id, userId, updatePortfolioDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete portfolio' })
  @ApiResponse({ status: 200, description: 'The portfolio has been successfully deleted.' })
  remove(@Req() req: any, @Param('id', ParseUUIDPipe) id: string): Promise<DeleteResult> {
    const userId: string = req.user?.userId;
    return this.portfolioService.remove(id, userId) as Promise<DeleteResult>;
  }
}
