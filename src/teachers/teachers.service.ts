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

@Injectable()
export class TeachersService {
  private defaultLimit: number;
  private offset: number;

  private readonly logger = new Logger('TeacherService');

  constructor(
    @InjectRepository(Teacher)
    private readonly teacherRepository: Repository<Teacher>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
    this.logger.log('TeacherService inicializado');
  }

  async create(createTeacherDto: CreateTeacherDto) {
    try {
      const teacher = this.teacherRepository.create(createTeacherDto);
      await this.teacherRepository.save(teacher);

      return teacher;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.teacherRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const teacher = await this.teacherRepository.findOneBy({
      id,
    });

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    return teacher;
  }

  async update(id: string, updateTeacherDto: UpdateTeacherDto) {
    const teacher = await this.teacherRepository.preload({
      id,
      ...updateTeacherDto,
    });

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);

    try {
      await this.teacherRepository.save(teacher);
      return teacher;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const teacher = await this.findOne(id);

    if (!teacher) throw new NotFoundException(`Teacher with ${id} not found`);
    console.log(teacher);

    await this.teacherRepository.remove(teacher);
    return teacher;
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
