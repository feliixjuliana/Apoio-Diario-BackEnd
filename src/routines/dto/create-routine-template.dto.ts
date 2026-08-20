import {
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsOptional,
  IsArray,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HORARIO_INICIO_MESSAGE,
  HORARIO_INICIO_PATTERN,
} from '../../common/validation/horario-inicio.validation';

export class CreateTemplateSubtaskDto {
  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;
}

export class CreateRoutineTemplateDto {
  @IsString()
  childId: string;

  @IsString()
  nomeTarefa: string;

  @IsNumber()
  @IsOptional()
  duracaoMinutos?: number;

  @IsOptional()
  @IsUrl()
  imgTarefa?: string;

  @IsOptional()
  @IsString()
  @Matches(HORARIO_INICIO_PATTERN, {
    message: HORARIO_INICIO_MESSAGE,
  })
  horarioInicio?: string | null;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSubtaskDto)
  @IsOptional()
  subtarefas?: CreateTemplateSubtaskDto[];
}
