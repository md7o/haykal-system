import { IsString } from 'class-validator';

export class UpdatePortfolioDto {
  @IsString()
  slug: string;
}
