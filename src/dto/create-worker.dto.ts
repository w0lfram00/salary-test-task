import { IsString, IsNotEmpty, IsEnum, IsDate } from 'class-validator';
import { WorkType } from '../generated/prisma/enums.js';

export class CreateWorkerDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsEnum(WorkType)
  type?: WorkType;

  @IsDate()
  startDate?: Date;
}
