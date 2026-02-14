import { IsString, IsOptional, IsUrl, IsEnum } from 'class-validator';
import { CommunityType } from '../../../common/enums/community-enums/community-type';

export class CreateCommunityDataDto {
  @IsOptional()
  @IsString()
  slug?: string;

  @IsOptional()
  @IsEnum(CommunityType)
  type?: CommunityType;

  @IsOptional()
  @IsString()
  description?: string;
}
