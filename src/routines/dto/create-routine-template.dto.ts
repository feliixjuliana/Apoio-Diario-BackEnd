import {
  IsString,
  IsNumber,
  IsBoolean,
  IsUrl,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class CreateTemplateSubtaskDto {
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

  @IsString()
  @IsOptional()
  horarioInicio?: string;

  @IsUrl()
  imgTarefa: string;

  @IsBoolean()
  @IsOptional()
  favorita?: boolean;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSubtaskDto)
  @IsOptional()
  subtarefas?: CreateTemplateSubtaskDto[];
}
