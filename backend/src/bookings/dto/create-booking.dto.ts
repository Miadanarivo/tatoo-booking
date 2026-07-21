import { IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { BodyZone } from '../entities/booking.entity';

export class CreateBookingDto {
  @IsUUID()
  artistId: string;

  @IsString()
  date: string; // format YYYY-MM-DD

  @IsString()
  startTime: string; // format HH:mm

  @IsOptional()
  @IsInt()
  @Min(15)
  durationMinutes?: number;

  @IsString()
  description: string;

  @IsOptional()
  @IsEnum(BodyZone)
  bodyZone?: BodyZone;
}