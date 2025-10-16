import { ConfigModule } from '@nestjs/config';
import { Module } from '@nestjs/common';
import { TeachersController } from './teachers.controller';
import { TeachersService } from './teachers.service';

@Module({
  controllers: [TeachersController],
  providers: [TeachersService],
  imports: [ConfigModule],
})
export class TeachersModule {}
