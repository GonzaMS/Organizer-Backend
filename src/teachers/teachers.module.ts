import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Teacher } from './entities/teacher.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Teacher, Faculty])],
})
export class TeachersModule {}
