import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateSubjectDto } from './dto/create-subject.dto';
import { UpdateSubjectDto } from './dto/update-subject.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { Repository } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';

@Injectable()
export class SubjectsService {
  private defaultLimit: number;
  private offset: number;

  private logger = new Logger('SubjectService');

  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,

    @InjectRepository(Teacher)
    private readonly teacherRepo: Repository<Teacher>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create({ facultyId, teacherId, ...subjectData }: CreateSubjectDto) {
    const faculty = await this.validateFaculty(facultyId);
    const teacher = await this.validateTeacher(teacherId);

    try {
      const subject = this.subjectRepo.create({
        ...subjectData,
        faculty,
        teacher,
      });

      await this.subjectRepo.save(subject);
      return subject;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.subjectRepo.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const subject = await this.subjectRepo.findOneBy({
      id,
    });

    if (!subject) throw new NotFoundException(`Subject with ${id} not found`);

    return subject;
  }

  async update(
    id: string,
    { facultyId, teacherId, ...subjectData }: UpdateSubjectDto,
  ) {
    if (!Object.keys(subjectData).length) {
      throw new BadRequestException('No fields provided for update');
    }

    const faculty = facultyId
      ? await this.validateFaculty(facultyId)
      : undefined;

    const teacher = teacherId
      ? await this.validateTeacher(teacherId)
      : undefined;

    const subject = await this.subjectRepo.preload({
      id,
      ...subjectData,
      faculty,
      teacher,
    });

    if (!subject) throw new NotFoundException(`Subject with ${id} not found`);

    try {
      await this.subjectRepo.save(subject);
      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const subject = await this.findOne(id);

    await this.subjectRepo.remove(subject);
    return subject;
  }

  async findAllSubjectsFromTeacher(teacherId: string) {
    await this.validateTeacher(teacherId);

    const teacherWithSubjects = await this.subjectRepo
      .createQueryBuilder('subject')
      .leftJoinAndSelect('subject.teacher', 'teacher')
      .where('teacher.id = :teacherId', { teacherId })
      .getMany();

    return teacherWithSubjects;
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

  /**
   * Validates if a teacher exists and returns it
   * @param teacherId - The teacher ID to validate
   * @returns The teacher entity
   * @throws NotFoundException if teacher doesn't exist
   */
  private async validateTeacher(teacherId: string): Promise<Teacher> {
    const teacher = await this.teacherRepo.findOneBy({ id: teacherId });

    if (!teacher) {
      throw new NotFoundException(`Teacher with id ${teacherId} not found`);
    }

    return teacher;
  }
}
