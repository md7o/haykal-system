import { IsArray, ValidateNested } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @ApiProperty({ description: 'Asset ID' })
  id: string;

  @ApiProperty({ description: 'New order' })
  order: number;
}

export class ReorderAssetsDto {
  @ApiProperty({ description: 'Array of assets with new order', type: [ReorderItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  orders: ReorderItemDto[];
}
