import { IsString, IsUrl, IsOptional, IsBoolean } from 'class-validator';

export class UpdateSubtaskDto {
  @IsString()
  @IsOptional()
  nomeTarefa?: string;

  @IsUrl()
  @IsOptional()
  imgTarefa?: string;

  @IsBoolean()
  @IsOptional()
  tarefaCompletada?: boolean;
}