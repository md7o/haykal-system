import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { MembershipService } from './membership.service';
import { Membership } from './entities/membership.entity';
import { CreateMembershipDto } from './dto/create-membership.dto';
import { UpdateMembershipDto } from './dto/update-membership.dto';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@ApiTags('Community - Membership')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community/membership')
export class MembershipController {
  constructor(private readonly service: MembershipService) {}

  @Post()
  @ApiOperation({ summary: 'Create user status' })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreateMembershipDto): Promise<Membership> {
    const userId: string = req.user.userId;
    return this.service.create(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List user statuses' })
  async findAll(@Req() req: AuthenticatedRequest): Promise<Membership[]> {
    const userId: string = req.user.userId;
    return this.service.findAllByUser(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get status by id' })
  async findOne(@Param('id') id: string): Promise<Membership | null> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update status' })
  async update(@Param('id') id: string, @Body() dto: UpdateMembershipDto): Promise<Membership> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete status' })
  async remove(@Param('id') id: string) {
    return this.service.remove(id);
  }
}
