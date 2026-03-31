import {
  IsString,
  IsInt,
  IsBoolean,
  IsOptional,
  Min,
  Max,
  IsIn,
  IsDateString,
} from 'class-validator';

export class CreateChildDto {
  @IsString({ message: 'O nome deve ser um texto' })
  nome: string;

  @IsDateString({}, { message: 'Data de nascimento inválida' })
  dataNascimento: string;

  @IsString()
  @IsOptional()
  @IsIn(['Masculino', 'Feminino', 'Outro', 'Prefiro não dizer'])
  genero?: string;

  @IsString()
  @IsOptional()
  @IsIn([
    'TEA',
    'TDAH',
    'Deficiência Intelectual',
    'Nenhuma das Opções Anteriores',
  ])
  condicao?: string;

  @IsString()
  @IsOptional()
  @IsIn(['1', '2', '3', 'Não sei Informar'])
  nivelSuporte?: string;
}
