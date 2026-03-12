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

  @IsUrl()
  imgTarefa: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSubtaskDto)
  @IsOptional()
  subtarefas?: CreateTemplateSubtaskDto[];
}
