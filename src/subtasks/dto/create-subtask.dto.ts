import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class CreateSubtaskDto {
  @IsString()
  routineId: string;

  @IsString()
  nomeTarefa: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;

  @IsBoolean()
  @IsOptional()
  tarefaCompletada?: boolean;
}