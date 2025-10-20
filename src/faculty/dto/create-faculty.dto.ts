import { IsString, MinLength } from 'class-validator';
import { Unique } from 'typeorm';

export class CreateFacultyDto {
  @IsString()
  @MinLength(3)
  facultyName: string;
}
