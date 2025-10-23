import { ConfigService } from '@nestjs/config';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Teacher } from './entities/teacher.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Injectable()
export class TeachersService {
  private defaultLimit: number;
  private offset: number;

  private readonly logger = new Logger('TeacherService');

  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,

    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create({ facultyId, ...teacherData }: CreateTeacherDto) {
    const faculty = await this.validateFaculty(facultyId);

    try {
      const teacher = this.teacherRepo.create({
        ...teacherData,
        faculty,
      });

      await this.teacherRepo.save(teacher);

      return teacher;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.teacherRepo.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepo.findOneBy({
      id,
    });

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    return teacher;
  }

  async update(id: string, { facultyId, ...teacherData }: UpdateTeacherDto) {
    if (!Object.keys(teacherData).length)
      throw new BadRequestException('No fields provided for update');

    const faculty = facultyId
      ? await this.validateFaculty(facultyId)
      : undefined;

    const teacher = await this.teacherRepo.preload({
      id,
      ...teacherData,
      faculty,
    });

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    try {
      await this.teacherRepo.save(teacher);
      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);

    await this.teacherRepo.remove(teacher);
    return teacher;
  }

  async findByFaculty(facultyId: string, paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    await this.validateFaculty(facultyId);

    const teacherByFaculty = this.teacherRepo
      .createQueryBuilder('teacher')
      .leftJoinAndSelect('teacher.faculty', 'faculty')
      .where('faculty.id = :facultyId', { facultyId })
      .take(limit)
      .skip(offset)
      .getMany();

    return teacherByFaculty;
  }

  private handleDBExceptions(error: any) {
    this.logger.error(error.detail);

    if (error.code === '23505') {
      throw new BadRequestException(error.detail);
    }

    if (error.code === '23502') {
      const column = error.column ?? this.extractColumnFromDetail(error.detail);
      throw new BadRequestException(`${column}' property cannot be null.`);
    }

    if (error.code === '22P02') throw new BadRequestException(error.detail);

    throw new InternalServerErrorException('Check server logs');
  }

  private extractColumnFromDetail(detail: string): string | undefined {
    // We get the column match on message and return that text
    const match = detail.match(/column "([^"]+)"/);
    return match ? match[1] : undefined;
  }

  /**
   * Validates if a faculty exists and returns it
   * @param facultyId - The faculty ID to validate
   * @returns The faculty entity
   * @throws NotFoundException if faculty doesn't exist
   */
  private async validateFaculty(facultyId: string): Promise<Faculty> {
    const faculty = await this.facultyRepo.findOneBy({ id: facultyId });

    if (!faculty) {
      throw new NotFoundException(`Faculty with id ${facultyId} not found`);
    }

    return faculty;
  }
}
