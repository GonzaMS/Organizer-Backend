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
import { CreateScheduleDto } from './dto/create-schedule.dto';
import { UpdateScheduleDto } from './dto/update-schedule.dto';
import { ScheduleService } from './schedule.service';

@Controller('schedule')
export class ScheduleController {
  constructor(private readonly scheduleService: ScheduleService) {}

  @Post()
  create(@Body() createScheduleDto: CreateScheduleDto) {
    return this.scheduleService.create(createScheduleDto);
  }

  @Get()
  findAll(@Query() paginationDto: PaginationDto) {
    return this.scheduleService.findAll(paginationDto);
  }

  @Get('faculty/:uuid')
  findAllSchedulesFromFaculty(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Query() paginationDto: PaginationDto,
  ) {
    return this.scheduleService.findAllSchedulesFromFaculty(
      uuid,
      paginationDto,
    );
  }

  @Get(':uuid')
  findOne(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.scheduleService.findOne(uuid);
  }

  @Patch(':uuid')
  update(
    @Param('uuid', ParseUUIDPipe) uuid: string,
    @Body() updateScheduleDto: UpdateScheduleDto,
  ) {
    return this.scheduleService.update(uuid, updateScheduleDto);
  }

  @Delete(':uuid')
  remove(@Param('uuid', ParseUUIDPipe) uuid: string) {
    return this.scheduleService.remove(uuid);
  }
}
