import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityItem } from './entities/community-items.entity';
import { Like } from '../user-activity/entities/like.entity';
import { Comment } from '../user-activity/entities/comment.entity';
import { CommunityItemsController } from './community-items.controller';
import { CommunityItemsService } from './community-items.service';
import { MembershipModule } from '../membership/membership.module';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityItem, Like, Comment]), MembershipModule],
  controllers: [CommunityItemsController],
  providers: [CommunityItemsService],
  exports: [CommunityItemsService],
})
export class CommunityItemsModule {}
