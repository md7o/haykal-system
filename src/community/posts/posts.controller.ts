import { Body, Controller, Delete, Get, Param, Patch, Post, Req, UseGuards, HttpCode } from '@nestjs/common';
import { PostsService } from './posts.service';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post as PostEntity } from './entities/post.entity';
import { JwtAuthGuard } from 'src/auth/guards/auth.guard';
import { ApiTags, ApiBearerAuth, ApiOperation } from '@nestjs/swagger';
import type { AuthenticatedRequest } from 'src/common/interfaces/authenticated-request.interface';

@ApiTags('Community - Posts')
@ApiBearerAuth()
@Controller('community/posts')
@UseGuards(JwtAuthGuard)
export class PostsController {
  constructor(private readonly postsService: PostsService) {}

  @Post()
  @ApiOperation({ summary: 'Create a post' })
  async create(@Req() req: AuthenticatedRequest, @Body() dto: CreatePostDto): Promise<PostEntity> {
    const userId: string = req.user.userId;
    return this.postsService.createPost(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'List posts for user' })
  async findAll(@Req() req: AuthenticatedRequest): Promise<PostEntity[]> {
    const userId: string = req.user.userId;
    return this.postsService.findAllPosts(userId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get post by id' })
  async findOne(@Param('id') id: string): Promise<PostEntity | null> {
    return this.postsService.findOnePost(id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a post' })
  async update(
    @Req() req: AuthenticatedRequest,
    @Param('id') id: string,
    @Body() dto: UpdatePostDto,
  ): Promise<PostEntity> {
    const userId: string = req.user.userId;
    return this.postsService.update(id, userId, dto);
  }

  @Delete(':id')
  @HttpCode(200)
  @ApiOperation({ summary: 'Delete a post' })
  async remove(@Req() req: AuthenticatedRequest, @Param('id') id: string) {
    const userId: string = req.user.userId;
    return this.postsService.remove(id, userId);
  }
}
