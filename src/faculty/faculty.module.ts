import { Module } from '@nestjs/common';
import { FacultyService } from './faculty.service';
import { FacultyController } from './faculty.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Faculty } from './entities/faculty.entity';
import { ConfigModule } from '@nestjs/config';

@Module({
  controllers: [FacultyController],
  providers: [FacultyService],
  imports: [ConfigModule, TypeOrmModule.forFeature([Faculty])],
})
export class FacultyModule {}
