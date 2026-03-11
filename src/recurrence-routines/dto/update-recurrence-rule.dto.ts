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
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

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
