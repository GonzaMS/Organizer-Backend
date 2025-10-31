import { PartialType } from '@nestjs/mapped-types';
import { RegisterUserDto } from 'src/common/dtos/auth/register.dto';

export class UpdateUserDto extends PartialType(RegisterUserDto) {}
