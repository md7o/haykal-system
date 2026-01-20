import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityDataDto } from './create-community-data.dto';
import { IsEnum, IsOptional, MaxLength } from 'class-validator';
import { CommunityType } from 'src/common/enums/community-type';

export class UpdateCommunityDataDto extends PartialType(CreateCommunityDataDto) {
  @IsOptional()
  @MaxLength(100)
  description?: string;

  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;
}
