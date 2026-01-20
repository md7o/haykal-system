import { Module } from '@nestjs/common';
import { CommunityItemsModule } from './community-items/community-items.module';
import { UserActivityModule } from './user-activity/user-activity.module';
import { MembershipModule } from './membership/membership.module';
import { CommunityDataModule } from './community-data/community-data.module';

@Module({
  imports: [CommunityItemsModule, UserActivityModule, MembershipModule, CommunityDataModule],
})
export class CommunityModule {}
