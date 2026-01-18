import { IsString, IsNumber, IsBoolean, IsUrl, IsOptional, IsArray, ValidateNested, IsDateString } from 'class-validator';
import { Type } from 'class-transformer';

class CreateSubtaskDto {
  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;

  @IsBoolean()
  @IsOptional()
  tarefaCompletada?: boolean;
}

export class CreateRoutineDto {
  @IsString()
  childId: string;

  @IsString()
  nomeTarefa: string;

  @IsNumber() // Aceita Float
  tempoEstimado: number;

  @IsUrl()
  imgTarefa: string;

  @IsString()
  categoria: string;

  @IsBoolean()
  @IsOptional()
  recorrente?: boolean;

  @IsBoolean()
  @IsOptional()
  favorita?: boolean;

  @IsDateString()
  dataTarefa: string;

  @IsBoolean()
  @IsOptional()
  usaSubtarefas?: boolean;

  @IsNumber()
  @IsOptional()
  prioridade?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskDto)
  @IsOptional()
  subtarefas?: CreateSubtaskDto[];
}