import {
  IsInt,
  IsString,
  MinLength,
  Min,
  IsOptional,
  IsEnum,
  IsUUID,
} from 'class-validator';

export class CreateClassroomDto {
  @IsString()
  @MinLength(3)
  name: string;

  @IsInt()
  @Min(1)
  capacity: number;

  @IsOptional()
  @IsEnum(['AVAILABLE', 'MAINTENANCE'])
  status?: 'AVAILABLE' | 'MAINTENANCE';

  @IsUUID()
  facultyId: string;
}
