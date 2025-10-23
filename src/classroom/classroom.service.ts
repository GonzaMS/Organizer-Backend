import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Repository } from 'typeorm';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Injectable()
export class ClassroomService {
  private defaultLimit: number;
  private offset: number;

  private logger = new Logger('ClassroomService');

  constructor(
    @InjectRepository(Classroom)
    private readonly classroomRepo: Repository<Classroom>,

    @InjectRepository(Faculty)
    private readonly facultyRepo: Repository<Faculty>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create({ facultyId, ...classroomData }: CreateClassroomDto) {
    const faculty = await this.validateFaculty(facultyId);

    try {
      const classroom = this.classroomRepo.create({
        ...classroomData,
        faculty,
      });

      await this.classroomRepo.save(classroom);
      return classroom;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.classroomRepo.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const classroom = await this.classroomRepo.findOneBy({
      id,
    });

    if (!classroom)
      throw new NotFoundException(`Classroom with id ${id} not found`);

    return classroom;
  }

  async update(
    id: string,
    { facultyId, ...classroomData }: UpdateClassroomDto,
  ) {
    if (!Object.keys(classroomData).length)
      throw new BadRequestException('No fields provided for update');

    const faculty = facultyId
      ? await this.validateFaculty(facultyId)
      : undefined;

    const classroom = await this.classroomRepo.preload({
      id,
      ...classroomData,
      faculty,
    });

    if (!classroom)
      throw new NotFoundException(`Classroom with ${id} not found`);

    try {
      await this.classroomRepo.save(classroom);
      return classroom;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const classroom = await this.findOne(id);

    await this.classroomRepo.remove(classroom);
    return { message: `Classroom with id ${id} has been removed` };
  }

  async findByFaculty(facultyId: string, paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    await this.validateFaculty(facultyId);

    const classroomByFaculty = this.classroomRepo
      .createQueryBuilder('classroom')
      .leftJoinAndSelect('classroom.faculty', 'faculty')
      .where('faculty.id = :facultyId', { facultyId })
      .take(limit)
      .skip(offset)
      .getMany();

    return classroomByFaculty;
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
