import {
  IsEmail,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  Min,
  MinLength,
} from 'class-validator';

export class CreateTeacherDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsEmail()
  @IsOptional()
  email?: string;

  @IsOptional()
  aviability?: any;

  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(0)
  maxHoursPerWeek?: number;
}
