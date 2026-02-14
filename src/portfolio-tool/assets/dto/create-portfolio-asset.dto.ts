import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { ColorTheme } from '../../../common/enums/portfolio-enums/color-theme';
import { FontTheme } from '../../../common/enums/portfolio-enums/font-theme';

export class CreateAssetDto {
  @ApiPropertyOptional({ description: 'Color theme', enum: ColorTheme })
  @IsEnum(ColorTheme)
  @IsOptional()
  colorTheme?: ColorTheme;

  @ApiPropertyOptional({ description: 'Font theme', enum: FontTheme })
  @IsEnum(FontTheme)
  @IsOptional()
  fontTheme?: FontTheme;
}
