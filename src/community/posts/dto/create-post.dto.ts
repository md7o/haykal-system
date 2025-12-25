import { IsNotEmpty, IsOptional, IsString, Max, MaxLength } from 'class-validator';

export class CreatePostDto {
  @IsNotEmpty()
  @IsString()
  @MaxLength(100)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(300)
  content?: string;

  @IsNotEmpty()
  @IsString()
  membershipId: string;
}
