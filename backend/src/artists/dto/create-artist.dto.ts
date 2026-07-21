import { IsArray, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator';
import { TattooStyle } from '../entities/artist.entity';

export class CreateArtistDto {
  @IsUUID()
  userId: string;

  @IsOptional()
  @IsUUID()
  salonId?: string;

  @IsOptional()
  @IsString()
  bio?: string;

  @IsOptional()
  @IsArray()
  styles?: TattooStyle[];

  @IsOptional()
  @IsNumber()
  hourlyRate?: number;
}