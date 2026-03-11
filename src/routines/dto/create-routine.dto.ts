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
  duracaoMinutos?: number;

  @IsBoolean()
  @IsOptional()
  tarefaCompletada?: boolean;

  @IsUrl()
  imgTarefa: string;

  @ValidateIf((o) => !o.salvarComoTemplate)
  @IsNotEmpty()
  @IsDateString()
  dataTarefa: string;

  @IsNumber()
  @IsOptional()
  prioridade?: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateSubtaskNestedDto)
  @IsOptional()
  subtarefas?: CreateSubtaskNestedDto[];

  @IsBoolean()
  @IsOptional()
  salvarComoTemplate?: boolean;
}
