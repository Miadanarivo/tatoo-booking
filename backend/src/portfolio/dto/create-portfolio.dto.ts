import { IsOptional, IsString } from 'class-validator';

export class CreatePortfolioDto {
  @IsOptional()
  @IsString()
  caption?: string;
}