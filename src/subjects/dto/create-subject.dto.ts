import { IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsInt()
  @Min(1)
  weeklyHours: number;

  @IsUUID()
  facultyId: string;

  @IsUUID()
  teacherId: string;
}
