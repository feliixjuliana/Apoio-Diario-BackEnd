import {
  IsString,
  IsBoolean,
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
  ValidateIf,
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

class UpdateRecurrenceSubtaskDto {
  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;
}

export class UpdateRecurrenceRuleDto {
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

  @ValidateIf((_, value) => value !== undefined)
  @IsString()
  @Matches(DATA_CIVIL_PATTERN, { message: DATA_CIVIL_MESSAGE })
  @IsDateString(
    { strict: true, strictSeparator: true },
    { message: DATA_CIVIL_MESSAGE },
  )
  dataInicio?: string;

  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @ArrayMinSize(1)
  @Type(() => Number)
  @IsInt({ each: true })
  @Min(1, { each: true })
  @Max(7, { each: true })
  diasSemana?: number[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateRecurrenceSubtaskDto)
  subtarefas?: UpdateRecurrenceSubtaskDto[];
}
