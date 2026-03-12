import { Type } from 'class-transformer';
import {
  IsArray,
  IsOptional,
  IsString,
  IsUrl,
  Min,
  ValidateNested,
} from 'class-validator';
import { CreateTemplateSubtaskDto } from './create-routine-template.dto';

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
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateTemplateSubtaskDto)
  subtarefas?: CreateTemplateSubtaskDto[];
}
