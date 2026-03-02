import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsIn,
} from 'class-validator';

export class CreateChildDto {
  @IsString({ message: 'O nome deve ser um texto' })
  nome: string;

  @IsInt({ message: 'A idade deve ser um número inteiro' })
  @Min(0, { message: 'A idade não pode ser negativa' })
  idade: number;

  @IsString()
  @IsOptional()
  @IsIn(['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])
  genero?: string;

  @IsString()
  @IsOptional()
  @IsIn(['TEA', 'TDAH', 'Deficiência Intelectual'])
  condicao?: string;

  @IsString()
  @IsOptional()
  @IsIn(['1', '2', '3'], { message: 'O nível de suporte deve ser 1, 2 ou 3' })
  nivelSuporte?: string;
}
