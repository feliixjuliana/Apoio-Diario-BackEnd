import {
  IsEmail,
  IsOptional,
  IsString,
  MinLength,
  IsInt,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateUserDto {
  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MinLength(6)
  senha?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pinParental?: number;
}
