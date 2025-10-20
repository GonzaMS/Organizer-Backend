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

@Injectable()
export class SubjectsService {
  private defaultLimit: number;
  private offset: number;

  private logger = new Logger('Subject Service');

  constructor(
    @InjectRepository(Subject)
    private readonly subjectRepository: Repository<Subject>,
    private readonly configService: ConfigService,
  ) {
    this.defaultLimit = configService.get<number>('DEFAULT_LIMIT')!;
    this.offset = configService.get<number>('OFFSET')!;
  }

  async create(createSubjectDto: CreateSubjectDto) {
    try {
      const subject = this.subjectRepository.create(createSubjectDto);
      await this.subjectRepository.save(createSubjectDto);

      return subject;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async findAll(paginationDto: PaginationDto) {
    const { limit = this.defaultLimit, offset = this.offset } = paginationDto;

    return this.subjectRepository.find({
      take: limit,
      skip: offset,
    });
  }

  async findOne(id: string) {
    const subject = await this.subjectRepository.findOneBy({
      id,
    });

    if (!subject) throw new NotFoundException(`Subject with ${id} not found`);

    return subject;
  }

  async update(id: string, updateSubjectDto: UpdateSubjectDto) {
    const subject = await this.subjectRepository.preload({
      id,
      ...updateSubjectDto,
    });

    if (!subject) throw new NotFoundException(`Subject with ${id} not found`);

    if (!Object.keys(updateSubjectDto).length)
      throw new BadRequestException('No fields provided for update');

    try {
      await this.subjectRepository.save(subject);
      return subject;
    } catch (error) {
      this.handleDBExceptions(error);
    }
  }

  async remove(id: string) {
    const subject = await this.findOne(id);

    if (!subject) throw new NotFoundException(`Subject with ${id} not found`);

    await this.subjectRepository.remove(subject);
    return subject;
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
