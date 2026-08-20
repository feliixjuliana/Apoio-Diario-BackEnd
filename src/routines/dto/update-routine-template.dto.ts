import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateTemplateSubtaskDto } from './create-routine-template.dto';
import {
  HORARIO_INICIO_MESSAGE,
  HORARIO_INICIO_PATTERN,
} from '../../common/validation/horario-inicio.validation';

export class UpdateRoutineTemplateDto {
  @IsOptional()
  @IsString()
  nomeTarefa?: string;

  @IsOptional()
  @IsUrl()
  imgTarefa?: string;

  @IsOptional()
  @Type(() => Number)
  @Min(0)
  duracaoMinutos?: number;

  @IsOptional()
  @IsString()
  @Matches(HORARIO_INICIO_PATTERN, {
    message: HORARIO_INICIO_MESSAGE,
  })
  horarioInicio?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSubtaskDto)
  subtarefas?: CreateTemplateSubtaskDto[];
}
