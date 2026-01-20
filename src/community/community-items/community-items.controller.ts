import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, HttpCode, Query } from '@nestjs/common';
import { CommunityItemsService } from './community-items.service';
import { UpdateCommunityItemsDto } from './dto/update-community-items.dto';
import { CommunityItem } from './entities/community-items.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiQuery } from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { CreateCommunityItemsDto } from './dto/create-community-items.dto';
import { CommunityItemType } from 'src/common/enums/community-item-type';

@ApiTags('Community - CommunityItems')
@ApiBearerAuth()
@Controller('community/community-items')
@UseGuards(JwtAuthGuard)
export class CommunityItemsController {
  constructor(private readonly communityItemsService: CommunityItemsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a community item' })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateCommunityItemsDto): Promise<CommunityItem> {
    const userId: string = req.user.userId;
    return this.communityItemsService.createCommunityItem(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List community items for user' })
  @ApiQuery({ name: 'type', enum: CommunityItemType, required: false, description: 'Filter by item type' })
  async findAll(
    @Req() req: AuthenticatedRequest,
    @Query('type') type?: CommunityItemType,
  ): Promise<Array<CommunityItem & { isActive: boolean }>> {
    const userId: string = req.user.userId;
    return this.communityItemsService.findAllCommunityItems(userId, type);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get community item by id' })
  async findOne(@Param('id') id: string): Promise<CommunityItem | null> {
    return this.communityItemsService.findOneCommunityItem(id);
  }

  @Get('membership/:membershipId')
  @ApiOperation({ summary: 'List community items by membership' })
  @ApiQuery({ name: 'communityId', required: true, description: 'Community ID' })
  @ApiQuery({ name: 'type', enum: CommunityItemType, required: false, description: 'Filter by item type' })
  async findByMembership(
    @Param('membershipId') membershipId: string,
    @Query('communityId') communityId: string,
    @Query('type') type?: CommunityItemType,
  ): Promise<Array<CommunityItem & { isActive: boolean }>> {
    return this.communityItemsService.findByMembershipId(membershipId, communityId, type);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a community item' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdateCommunityItemsDto,
  ): Promise<CommunityItem> {
    const userId: string = req.user.userId;
    return this.communityItemsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a community item' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId: string = req.user.userId;
    return this.communityItemsService.remove(id, userId);
  }
}
