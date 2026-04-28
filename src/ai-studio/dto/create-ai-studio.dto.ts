import { IsString, IsOptional, IsObject, IsNotEmpty } from 'class-validator';

export class CreateAiStudioDto {
  @IsNotEmpty()
  @IsString()
  projectName: string;

  @IsOptional()
  @IsObject()
  answersData?: Record<string, any>;
}
