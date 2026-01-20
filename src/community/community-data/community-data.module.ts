import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommunityDataService } from './community-data.service';
import { CommunityDataController } from './community-data.controller';
import { CommunityData } from './entities/community-data.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CommunityData])],
  controllers: [CommunityDataController],
  providers: [CommunityDataService],
  exports: [CommunityDataService],
})
export class CommunityDataModule {}
