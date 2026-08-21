import {
  ArrayNotEmpty,
  ArrayUnique,
  IsArray,
  IsInt,
  IsString,
  Min,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

class ReorderItemDto {
  @IsString()
  id: string;

  @IsInt()
  @Min(1)
  prioridade: number;
}

export class ReorderRoutinesDto {
  @IsArray()
  @ArrayNotEmpty()
  @ArrayUnique((item?: ReorderItemDto) => item?.id)
  @ArrayUnique((item?: ReorderItemDto) => item?.prioridade)
  @ValidateNested({ each: true })
  @Type(() => ReorderItemDto)
  items: ReorderItemDto[];
}
