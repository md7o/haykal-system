import { Module } from '@nestjs/common';
import { PostsModule } from './posts/posts.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { MembershipModule } from './membership/membership.module';

@Module({
  imports: [PostsModule, UserActivityModule, MembershipModule],
})
export class CommunityModule {}
