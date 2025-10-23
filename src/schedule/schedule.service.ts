import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Repository } from 'typeorm';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Injectable()
export class ScheduleService {
  private defaultLimit: number;
  private offset: number;

  private logger = new Logger('ScheduleService');

  constructor(
    @InjectRepository(Schedule)
    private readonly scheduleRepo: Repository<Schedule>,

    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(Subject)
    private readonly subjectRepo: Repository<Subject>,

    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  // TODO: Add faculty relation in the future
  async create({ classroomId, subjectId, ...scheduleData }: CreateScheduleDto) {
    const classroom = await this.validateClassroom(classroomId);
    const subject = await this.validateSubject(subjectId);

    try {
      const schedule = this.scheduleRepo.create({
        ...scheduleData,
        classroom,
        subject,
      });

      await this.scheduleRepo.save(schedule);
      return schedule;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.scheduleRepo.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const schedule = await this.scheduleRepo.findOneBy({
      id,
    });

    if (!schedule) throw new NotFoundException(`Schedule with ${id} not found`);

    return schedule;
  }

  async update(
    id: string,
    { classroomId, subjectId, ...scheduleData }: UpdateScheduleDto,
  ) {
    if (!Object.keys(scheduleData).length) {
      throw new BadRequestException('No fields provided for update');
    }

    const classroom = classroomId
      ? await this.validateClassroom(classroomId)
      : undefined;

    const subject = subjectId
      ? await this.validateSubject(subjectId)
      : undefined;

    const schedule = await this.scheduleRepo.preload({
      id,
      ...scheduleData,
      classroom,
      subject,
    });

    if (!schedule) throw new NotFoundException(`Schedule with ${id} not found`);

    try {
      await this.scheduleRepo.save(schedule);
      return this.findOne(id);
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const schedule = await this.findOne(id);

    await this.scheduleRepo.remove(schedule);

    return { message: `Schedule with id ${id} has been removed` };
  }

  async findAllSchedulesFromFaculty(
    facultyId: string,
    paginationDto: PaginationDto,
  ) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    await this.validateFaculty(facultyId);

    const schedulesFromFaculty = this.scheduleRepo
      .createQueryBuilder('schedule')
      .leftJoinAndSelect('schedule.classroom', 'classroom')
      .leftJoinAndSelect('schedule.subject', 'subject')
      .leftJoinAndSelect('subject.faculty', 'faculty')
      .where('faculty.id = :facultyId', { facultyId })
      .take(limit)
      .skip(offset)
      .getMany();

    return schedulesFromFaculty;
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
   * Validates if a subject exists and returns it
   * @param subjectId - The subject ID to validate
   * @returns The subject entity
   * @throws NotFoundException if subject doesn't exist
   */
  private async validateSubject(subjectId: string): Promise<Subject> {
    const subject = await this.subjectRepo.findOneBy({ id: subjectId });

    if (!subject) {
      throw new NotFoundException(`Subject with id ${subjectId} not found`);
    }

    return subject;
  }

  /**
   * Validates if a classroom exists and returns it
   * @param classroomId - The classroom ID to validate
   * @returns The classroom entity
   * @throws NotFoundException if classroom doesn't exist
   */
  private async validateClassroom(classroomId: string): Promise<Classroom> {
    const classroom = await this.classroomRepo.findOneBy({ id: classroomId });

    if (!classroom) {
      throw new NotFoundException(`Classroom with id ${classroomId} not found`);
    }

    return classroom;
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
