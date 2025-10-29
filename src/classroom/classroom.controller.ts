import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { PaginationDto } from 'src/common/dtos/pagination.dto';
import { ParseStatusIdPipe } from 'src/common/pipes/parse-status-id/parse-status-id.pipe';
import { ClassroomService } from './classroom.service';
import { CreateClassroomDto } from './dto/create-classroom.dto';
import { UpdateClassroomDto } from './dto/update-classroom.dto';

@Controller('classroom')
export class ClassroomController {
  constructor(private readonly classroomService: ClassroomService) {}

  @Post()
  create(@Body() createClassroomDto: CreateClassroomDto) {
    return this.classroomService.create(createClassroomDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.classroomService.findAll(paginationDto);
  }

  @Get('status/:status')
  findByStatus(
    @Param('status', ParseStatusIdPipe) classroomStatus: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.classroomService.findByStatus(classroomStatus, paginationDto);
  }

  @Get('faculty/:uuid')
  findByFaculty(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.classroomService.findByFaculty(uuid, paginationDto);
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.classroomService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateClassroomDto: UpdateClassroomDto,
  ) {
    return this.classroomService.update(uuid, updateClassroomDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.classroomService.remove(uuid);
  }
}
