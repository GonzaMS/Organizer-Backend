import { Module } from '@nestjs/common';
import { ClassroomService } from './classroom.service';
import { ClassroomController } from './classroom.controller';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Classroom } from './entities/classroom.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Module({
  controllers: [ClassroomController],
  providers: [ClassroomService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Classroom, Faculty])],
})
export class ClassroomModule {}
