import {
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsOptional,
  IsArray,
  IsDateString,
} from 'class-validator';

export class CreateRoutineDto {
  @IsString()
  childId: string;

  @IsString()
  nomeTarefa: string;

  @IsNumber()
  duracaoMinutos: number;

  @IsString()
  horarioInicio: string;

  @IsUrl()
  @IsOptional()
  imgTarefa: string;

  @IsString()
  categoria: string;

  @IsDateString()
  dataTarefa: string;

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsArray()
  @IsOptional()
  diasSemana?: number[];

  @IsBoolean()
  @IsOptional()
  favorita?: boolean;

  @IsNumber()
  @IsOptional()
  prioridade?: number;
}
