import { IsString, IsUUID } from 'class-validator';

export class CreatePortfolioDto {
  @IsUUID()
  userId: string;

  @IsString()
  slug: string;
}
