import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderSectionsDto {
  @ApiProperty({ description: 'Array of section IDs in the desired order' })
  @IsArray()
  @IsUUID('4', { each: true })
  sectionIds: string[];
}
