import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';
import { CreateCommentDto } from './dto/create-comment.dto';
import { UpdateCommentDto } from './dto/update-comment.dto';
import { Throttle } from '@nestjs/throttler';

@ApiTags('Community - UserActivity')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('community/user-activity')
export class UserActivityController {
  constructor(private readonly service: UserActivityService) {}

  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @Post('likes/:communityItemId/toggle')
  @ApiOperation({ summary: 'Toggle like for a community item' })
  async toggleLike(@Req() req: AuthenticatedRequest, @Param('communityItemId') communityItemId: string) {
    const userId: string = req.user.userId;
    return this.service.toggleLike(userId, communityItemId);
  }

  // ============ COMMENTS ENDPOINTS =============
  @Post('comments/:communityItemId')
  @ApiOperation({ summary: 'Create comment for a community item' })
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('communityItemId') communityItemId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId: string = req.user.userId;
    return this.service.createComment(userId, communityItemId, dto.content);
  }

  @Get('comments/count')
  @ApiOperation({ summary: 'Count comments by authenticated user' })
  async countCommentsByUser(@Req() req: AuthenticatedRequest) {
    const userId: string = req.user.userId;
    return this.service.countCommentsByUser(userId);
  }

  @Get('comments/:communityItemId')
  @ApiOperation({ summary: 'List comments for a community item' })
  async listComments(@Param('communityItemId') communityItemId: string) {
    return this.service.findAllCommentsByCommunityItem(communityItemId);
  }

  @Delete('comments/:commentId')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(@Param('commentId') commentId: string) {
    return this.service.removeComment(commentId);
  }

  @Patch('comments/:commentId')
  @ApiOperation({ summary: 'Update comment' })
  async updateComment(@Param('commentId') commentId: string, @Body() dto: UpdateCommentDto) {
    return this.service.updateComment(commentId, dto.content);
  }
}
