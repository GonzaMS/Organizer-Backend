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

  async create(createTeacherDto: CreateTeacherDto) {
    const faculty = await this.facultyRepo.findOne({
      where: { id: createTeacherDto.facultyId },
    });

    if (!faculty)
      throw new NotFoundException(
        `Faculty with id ${createTeacherDto.facultyId} not found`,
      );

    try {
      const teacher = this.teacherRepo.create({
        ...createTeacherDto,
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
      relations: ['faculty'],
    });
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepo.findOne({
      where: { id },
      relations: ['faculty'],
    });

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    if (!Object.keys(updateTeacherDto).length)
      throw new BadRequestException('No fields provided for update');

    if (updateTeacherDto.facultyId) {
      const faculty = await this.facultyRepo.findOne({
        where: { id: updateTeacherDto.facultyId },
      });

      if (!faculty)
        throw new NotFoundException(
          `Faculty with id ${updateTeacherDto.facultyId} not found`,
        );
    }

    const teacher = await this.teacherRepo.preload({
      id,
      ...updateTeacherDto,
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

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    await this.teacherRepo.remove(teacher);
    return teacher;
  }

  async findByFaculty(facultyId: string, paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    const faculty = await this.facultyRepo.findOne({
      where: {
        id: facultyId,
      },
    });

    if (!faculty)
      throw new NotFoundException(`Faculty with ${facultyId} not found`);

    return this.teacherRepo.find({
      where: {
        faculty: { id: facultyId },
      },
      relations: ['faculty'],
      take: limit,
      skip: offset,
    });
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
}
