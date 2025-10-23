import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { CreateFacultyDto } from './dto/create-faculty.dto';
import { UpdateFacultyDto } from './dto/update-faculty.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { Repository } from 'typeorm';

@Injectable()
export class FacultyService {
  private defaultLimit: number;
  private offset: number;

  private logger = new Logger('Faculty service');

  constructor(
    @InjectRepository(Faculty)
    private readonly facultyService: Repository<Faculty>,

    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create(createFacultyDto: CreateFacultyDto) {
    try {
      const faculty = this.facultyService.create(createFacultyDto);

      await this.facultyService.save(faculty);

      return faculty;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.facultyService.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const faculty = await this.facultyService.findOneBy({
      id,
    });

    if (!faculty) throw new NotFoundException(`Faculty with ${id} not found`);

    return faculty;
  }

  async update(id: string, updateFacultyDto: UpdateFacultyDto) {
    if (!Object.keys(updateFacultyDto).length)
      throw new BadRequestException('No fields provided for update');

    const faculty = await this.facultyService.preload({
      id,
      ...updateFacultyDto,
    });

    if (!faculty) throw new NotFoundException(`Faculty with ${id} not found`);

    try {
      await this.facultyService.save(faculty);
      return faculty;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const faculty = await this.findOne(id);

    if (!faculty) throw new NotFoundException(`Faculty with ${id} not found`);

    await this.facultyService.remove(faculty);
    return faculty;
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
