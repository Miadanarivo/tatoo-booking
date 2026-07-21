import { IsEmail, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export enum PublicRole {
  CLIENT = 'client',
  ARTIST = 'artist',
}

export class InitRegisterDto {
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsEnum(PublicRole, { message: 'Le rôle doit être "client" ou "artist"' })
  role?: PublicRole;
}