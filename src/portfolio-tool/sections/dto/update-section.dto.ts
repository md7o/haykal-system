import { IsEnum, IsInt, IsObject, IsOptional, IsString, MaxLength, IsNotEmpty } from 'class-validator';
import { SectionsType } from 'src/common/enums/portfolio-enums/sections-type';

export class UpdateSectionDto {
  @IsNotEmpty()
  @IsEnum(SectionsType)
  type: SectionsType;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
