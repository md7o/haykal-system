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
  @Post('likes/:postId/toggle')
  @ApiOperation({ summary: 'Toggle like for a post' })
  async toggleLike(@Req() req: AuthenticatedRequest, @Param('postId') postId: string) {
    const userId: string = req.user.userId;
    return this.service.toggleLike(userId, postId);
  }
  @Throttle({ default: { limit: 20, ttl: 60000 } }) // 20 requests per minute
  @Post('saves/:postId/toggle')
  @ApiOperation({ summary: 'Toggle save for a post' })
  async toggleSave(@Req() req: AuthenticatedRequest, @Param('postId') postId: string) {
    const userId: string = req.user.userId;
    return this.service.toggleSave(userId, postId);
  }

  @Post('comments/:postId')
  @ApiOperation({ summary: 'Create comment for a post' })
  async createComment(
    @Req() req: AuthenticatedRequest,
    @Param('postId') postId: string,
    @Body() dto: CreateCommentDto,
  ) {
    const userId: string = req.user.userId;
    return this.service.createComment(userId, postId, dto.content);
  }

  @Get('comments/:postId')
  @ApiOperation({ summary: 'List comments for a post' })
  async listComments(@Param('postId') postId: string) {
    return this.service.findAllCommentsByPost(postId);
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
