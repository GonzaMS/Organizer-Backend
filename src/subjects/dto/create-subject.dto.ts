import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateSubjectDto {
  @IsString()
  code: string;

  @IsString()
  name: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  credits?: number;

  @IsOptional()
  @IsString()
  department?: string;
}
