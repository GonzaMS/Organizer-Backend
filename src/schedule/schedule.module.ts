import { Module } from '@nestjs/common';
import { ScheduleService } from './schedule.service';
import { ScheduleController } from './schedule.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Schedule } from './entities/schedule.entity';
import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Module({
  controllers: [ScheduleController],
  providers: [ScheduleService],
  imports: [
    ConfigModule,
    TypeOrmModule.forFeature([Schedule, Classroom, Subject, Faculty]),
  ],
})
export class ScheduleModule {}
