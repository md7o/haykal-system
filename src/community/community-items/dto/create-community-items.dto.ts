import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { CommunityItemType } from 'src/common/enums/community-item-type';
import type { CommunityItemMetadata } from 'src/common/interfaces/community-item-metadata.interface';

export class CreateCommunityItemsDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  content?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  metadata?: CommunityItemMetadata;

  @IsNotEmpty()
  @IsUUID()
  communityId: string;

  @IsNotEmpty()
  @IsString()
  membershipId: string;

  @IsNotEmpty()
  @IsEnum(CommunityItemType)
  type: CommunityItemType;
}
