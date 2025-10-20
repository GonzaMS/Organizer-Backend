import { Module } from '@nestjs/common';
import { SubjectsService } from './subjects.service';
import { SubjectsController } from './subjects.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Subject } from './entities/subject.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [SubjectsController],
  providers: [SubjectsService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Subject])],
})
export class SubjectsModule {}
