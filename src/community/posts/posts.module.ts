import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { Post } from './entities/post.entity';
import { Like } from '../user-activity/entities/like.entity';
import { Comment } from '../user-activity/entities/comment.entity';
import { Save } from '../user-activity/entities/save.entity';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([Post, Like, Comment, Save]), MembershipModule],
  controllers: [PostsController],
  providers: [PostsService],
  exports: [PostsService],
})
export class PostsModule {}
