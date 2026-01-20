import { PartialType } from '@nestjs/mapped-types';
import { CreateCommunityItemsDto } from './create-community-items.dto';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsObject, IsOptional, IsString } from 'class-validator';
import type { CommunityItemMetadata } from 'src/common/interfaces/community-item-metadata.interface';

export class UpdateCommunityItemsDto extends PartialType(CreateCommunityItemsDto) {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  content?: string;

  @IsOptional()
  @IsString()
  postImage?: string;

  @IsOptional()
  @IsString()
  membershipId?: string;

  @IsOptional()
  @IsObject()
  @ApiPropertyOptional({ type: 'object', additionalProperties: true })
  metadata?: CommunityItemMetadata;
}
