import { IsEnum, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { SectionsType } from 'src/common/enums/portfolio-enums/sections-type';

export class CreateSectionDto {
  @IsNotEmpty()
  @IsEnum(SectionsType)
  type: SectionsType;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
