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

  @IsBoolean()
  @IsOptional()
  favorita?: boolean;

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
