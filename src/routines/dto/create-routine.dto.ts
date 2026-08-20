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
  Matches,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HORARIO_INICIO_MESSAGE,
  HORARIO_INICIO_PATTERN,
} from '../../common/validation/horario-inicio.validation';

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

  @IsOptional()
  @IsUrl()
  imgTarefa?: string;

  @IsOptional()
  @IsString()
  @Matches(HORARIO_INICIO_PATTERN, {
    message: HORARIO_INICIO_MESSAGE,
  })
  horarioInicio?: string | null;

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
