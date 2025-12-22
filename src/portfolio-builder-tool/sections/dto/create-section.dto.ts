import { IsNotEmpty, IsObject, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateSectionDto {
  @ApiProperty({ description: 'Type of the section', example: 'hero' })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    description: 'Configuration for the section',
    example: { title: 'Welcome', subtitle: 'To my portfolio' },
  })
  @IsObject()
  config: Record<string, any>;
}
