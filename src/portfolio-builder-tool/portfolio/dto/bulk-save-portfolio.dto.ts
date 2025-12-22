import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsInt, IsNotEmpty, IsObject, IsOptional, IsString, IsUUID, ValidateNested } from 'class-validator';

export class BulkSectionDto {
  @ApiPropertyOptional({ description: 'ID of the section (if updating)' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Type of the section' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({ description: 'Configuration for the section' })
  @IsObject()
  config: Record<string, any>;

  @ApiProperty({ description: 'Order of the section' })
  @IsInt()
  order: number;
}

export class BulkPageDto {
  @ApiPropertyOptional({ description: 'ID of the page (if updating)' })
  @IsUUID()
  @IsOptional()
  id?: string;

  @ApiProperty({ description: 'Title of the page' })
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty({ description: 'Slug of the page' })
  @IsString()
  @IsNotEmpty()
  slug: string;

  @ApiProperty({ description: 'Order of the page' })
  @IsInt()
  order: number;

  @ApiProperty({ description: 'Sections of the page', type: [BulkSectionDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkSectionDto)
  sections: BulkSectionDto[];
}

export class BulkSavePortfolioDto {
  @ApiProperty({ description: 'Pages of the portfolio', type: [BulkPageDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BulkPageDto)
  pages: BulkPageDto[];

  @ApiPropertyOptional({ description: 'Global assets for the portfolio' })
  @IsObject()
  @IsOptional()
  assets?: Record<string, any>;
}
