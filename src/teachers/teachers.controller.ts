import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { TeachersService } from './teachers.service';
import { CreateTeacherDto } from './dto/create-teacher.dto';
import { UpdateTeacherDto } from './dto/update-teacher.dto';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('v1/teachers')
export class TeachersController {
  constructor(private readonly teachersService: TeachersService) {}

  @Post()
  create(@Body() createTeacherDto: CreateTeacherDto) {
    return this.teachersService.create(createTeacherDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.teachersService.findAll(paginationDto);
  }

  @Get('faculty/:uuid')
  findByFaculty(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.teachersService.findByFaculty(uuid, paginationDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.teachersService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateTeacherDto: UpdateTeacherDto,
  ) {
    return this.teachersService.update(uuid, updateTeacherDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.teachersService.remove(uuid);
  }
}
