import {
  IsEmail,
  IsString,
  MinLength,
  IsInt,
  Min,
  Max,
  IsUUID,
  IsDate,
} from 'class-validator';

export class CreateUserDto {
  @IsUUID()
  id: string;

  @IsEmail({}, { message: 'O e-mail informado é inválido' })
  email: string;

  @IsString()
  @MinLength(6, { message: 'A senha deve ter no mínimo 6 caracteres' })
  password: string;

  @IsInt({ message: 'O PIN Parental deve ser um número' })
  @Min(1000, { message: 'O PIN deve ter no mínimo 4 dígitos' })
  @Max(9999, { message: 'O PIN deve ter no máximo 4 dígitos' })
  pinParental: number;

  @IsDate()
  criadoEm: Date;

  tokenRecuperacao?: string | null;
  expiracaoRecuperacao?: Date | null;
}
