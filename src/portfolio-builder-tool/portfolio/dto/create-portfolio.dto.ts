import { IsOptional, IsObject, IsString, Length, Matches, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePortfolioDto {
  @ApiPropertyOptional({ description: 'Unique slug for the portfolio', example: 'my-portfolio' })
  @IsOptional()
  @IsString()
  @Length(1, 50)
  @Matches(/^[a-z0-9-]+$/)
  slug?: string | null;

  @ApiPropertyOptional({ description: 'Status of the portfolio', enum: ['DRAFT', 'PUBLISHED'], default: 'DRAFT' })
  @IsOptional()
  @IsEnum(['DRAFT', 'PUBLISHED'])
  status?: 'DRAFT' | 'PUBLISHED';

  @ApiPropertyOptional({ description: 'Initial pages for the portfolio' })
  @IsOptional()
  @IsArray()
  pages?: Array<Record<string, any>> | null;

  // Deprecated: kept for backward compatibility with older clients
  @ApiPropertyOptional({ description: 'Deprecated: use pages instead' })
  @IsOptional()
  @IsArray()
  page?: Array<Record<string, any>> | null;

  @ApiPropertyOptional({ description: 'Global assets for the portfolio' })
  @IsOptional()
  @IsObject()
  assets?: Record<string, any> | null;
}
