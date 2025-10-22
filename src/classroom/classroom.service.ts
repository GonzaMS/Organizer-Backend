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
  private logger = new Logger();

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

  async create(createClassroomDto: CreateClassroomDto) {
    const faculty = await this.facultyRepo.findOneBy({
      id: createClassroomDto.facultyId,
    });

    if (!faculty)
      throw new NotFoundException(
        `Faculty with id ${createClassroomDto.facultyId} not found`,
      );

    try {
      const classroom = this.classroomRepo.create({
        ...createClassroomDto,
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
      relations: {
        faculty: true,
      },
    });
  }

  async findOne(id: string) {
    const classroom = await this.classroomRepo.findOne({
      where: { id },
      relations: {
        faculty: true,
      },
    });

    if (!classroom)
      throw new NotFoundException(`Classroom with id ${id} not found`);

    return classroom;
  }

  async update(id: string, updateClassroomDto: UpdateClassroomDto) {
    if (!Object.keys(updateClassroomDto).length)
      throw new BadRequestException('No fields provided for update');

    if (updateClassroomDto.facultyId) {
      const faculty = await this.facultyRepo.findOne({
        where: { id: updateClassroomDto.facultyId },
      });

      if (!faculty)
        throw new NotFoundException(
          `Faculty with id ${updateClassroomDto.facultyId} not found`,
        );
    }

    const classroom = await this.classroomRepo.preload({
      id,
      ...updateClassroomDto,
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

    if (!classroom)
      throw new NotFoundException(`Classroom with ${id} not found`);

    await this.classroomRepo.remove(classroom);
    return { message: `Classroom with id ${id} has been removed` };
  }

  async findByFaculty(facultyId: string, paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    const faculty = await this.facultyRepo.findOne({
      where: { id: facultyId },
    });

    if (!faculty)
      throw new NotFoundException(`Faculty with ${facultyId} not found`);

    return this.classroomRepo.find({
      where: {
        faculty: { id: facultyId },
      },
      relations: {
        faculty: true,
      },
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
