import { IsObject, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateSectionDto {
  @ApiPropertyOptional({ description: 'Configuration for the section' })
  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
