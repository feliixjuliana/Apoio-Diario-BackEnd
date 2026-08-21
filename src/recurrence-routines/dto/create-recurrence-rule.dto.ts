import {
  IsString,
  IsUrl,
  IsOptional,
  IsArray,
  ArrayNotEmpty,
  ArrayMinSize,
  IsInt,
  Min,
  Max,
  IsDateString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';
import {
  HORARIO_INICIO_MESSAGE,
  HORARIO_INICIO_PATTERN,
} from '../../common/validation/horario-inicio.validation';
import {
  DATA_CIVIL_MESSAGE,
  DATA_CIVIL_PATTERN,
} from '../../common/date/data-civil';

class CreateRecurrenceSubtaskDto {
  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;
}

export class CreateRecurrenceRuleDto {
  @IsString()
  childId: string;

  @IsString()
  nomeTarefa: string;

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

  @IsString()
  @Matches(DATA_CIVIL_PATTERN, { message: DATA_CIVIL_MESSAGE })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: DATA_CIVIL_MESSAGE },
  )
  dataInicio: string;

  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  diasSemana: number[]; // 1..7

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateRecurrenceSubtaskDto)
  subtarefas?: CreateRecurrenceSubtaskDto[];
}
