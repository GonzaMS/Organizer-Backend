import {
  IsEmail,
  IsInt,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  email: string;

  @IsOptional()
  @IsObject()
  availability?: Record<string, string[]>;

  @IsOptional()
  @IsInt()
  @Min(1)
  maxHoursPerWeek?: number;

  @IsUUID()
  facultyId: string;
}
