import { IsString, IsEnum, IsDate, IsUUID } from 'class-validator';
import { WorkType } from '../generated/prisma/enums.js';

export class EditWorkerDto {
  @IsString()
  name?: string;

  @IsString()
  @IsEnum(WorkType)
  type?: WorkType;

  @IsDate()
  startDate?: Date;

  @IsString()
  @IsUUID()
  managerId?: string | null;
}
