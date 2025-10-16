import {
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsInt()
  @IsNotEmpty()
  id: number;

  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsOptional()
  aviability?: any;

  @IsOptional()
  @IsInt()
  maxHoursPerWeek?: number;
}
