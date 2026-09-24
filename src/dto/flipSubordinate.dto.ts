import { IsString } from 'class-validator';

export class FlipSubordinateDto {
  @IsString()
  id: string;
}
