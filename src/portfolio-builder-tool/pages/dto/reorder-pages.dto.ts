import { IsArray, IsUUID } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ReorderPagesDto {
  @ApiProperty({ description: 'Array of page IDs in the desired order' })
  @IsArray()
  @IsUUID('4', { each: true })
  pageIds: string[];
}
