import { ConfigService } from '@nestjs/config';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';

@Injectable()
export class TeachersService {
  private defaultLimit: number;
  private offset: number;

  constructor(private readonly configService: ConfigService) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  teachers: CreateTeacherDto[] = [
    {
      id: 1,
      name: 'John Doe',
      email: 'john.doe@example.com',
      aviability: [
        {
          day: 'monday',
          start: '09:00',
          end: '17:00',
        },
      ],
      maxHoursPerWeek: 10,
    },
    {
      id: 2,
      name: 'Jane Doe',
      email: 'jane.doe@example.com',
      aviability: [
        {
          day: 'monday',
          start: '09:00',
          end: '17:00',
        },
      ],
      maxHoursPerWeek: 10,
    },
    {
      id: 3,
      name: 'Jim Doe',
      email: 'jim.doe@example.com',
      aviability: [
        {
          day: 'monday',
          start: '09:00',
          end: '17:00',
        },
      ],
      maxHoursPerWeek: 10,
    },
  ];

  create(createTeacherDto: CreateTeacherDto) {
    return 'This action adds a new teacher';
  }

  findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.teachers;
  }

  findOne(id: number) {
    const teacher = this.teachers.find((t) => t.id === id);
    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    return teacher;
  }

  update(id: number, updateTeacherDto: UpdateTeacherDto) {
    return `This action updates a #${id} teacher`;
  }

  remove(id: number) {
    const teacher = this.findOne(id);
    this.teachers = this.teachers.filter((t) => t.id !== id);
    return teacher;
  }
}
