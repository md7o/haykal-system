import { Module } from '@nestjs/common';
import { UserActivityService } from './user-activity.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Like } from './entities/like.entity';
import { Comment } from './entities/comment.entity';
import { Save } from './entities/save.entity';
import { Post } from '../posts/entities/post.entity';
import { UserActivityController } from './user-activity.controller';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([Like, Comment, Save, Post]), MembershipModule],
  controllers: [UserActivityController],
  providers: [UserActivityService],
  exports: [UserActivityService],
})
export class UserActivityModule {}
