import { IsString, IsUUID } from 'class-validator';

export class CreateScheduleDto {
  @IsString()
  day: string;

  @IsString()
  startTime: string;

  @IsString()
  endTime: string;

  @IsUUID()
  subjectId: string;

  @IsUUID()
  classroomId: string;

  // TODO: Add facultyId in the future
}
