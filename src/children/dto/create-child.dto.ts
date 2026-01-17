import { IsString, IsInt, IsBoolean, IsOptional, Min, Max, IsIn } from 'class-validator';

export class CreateChildDto {
  @IsString({ message: 'O nome deve ser um texto' })
  nome: string;

  @IsInt({ message: 'A idade deve ser um número inteiro' })
  @Min(0, { message: 'A idade não pode ser negativa' })
  @Max(18, { message: 'A idade máxima permitida é 18 anos' })
  idade: number;
}