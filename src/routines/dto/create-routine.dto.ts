import {
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsOptional,
  IsArray,
  IsDateString,
  ValidateNested,
  IsNotEmpty,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateSubtaskNestedDto {
  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;
}

export class CreateRoutineDto {
  @IsString()
  childId: string;

  @IsString()
  nomeTarefa: string;

  @IsNumber()
  @IsOptional()
  duracaoMinutos: number;

  @IsString()
  @IsOptional()
  horarioInicio: string;

  @IsUrl()
  imgTarefa: string;

  @ValidateIf((o) => !o.recorrente)
  @IsNotEmpty()
  @IsDateString()
  dataTarefa: string;

  @IsArray()
  @IsOptional()
  diasSemana?: number[];

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsBoolean()
  @IsOptional()
  favorita?: boolean;

  @IsNumber()
  @IsOptional()
  prioridade?: number;

  @IsBoolean()
  @IsOptional()
  tarefaCompletada?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskNestedDto)
  @IsOptional()
  subtarefas?: CreateSubtaskNestedDto[];
}
