import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module';
import { ClassroomModule } from './classroom/classroom.module';
import { CommonModule } from './common/common.module';
import { EnvConfiguration } from './common/config/env.config';
import { JoiValidationSchema } from './common/config/joi.validation';
import { FacultyModule } from './faculty/faculty.module';
import { OptimizerModule } from './optimizer/optimizer.module';
import { ScheduleModule } from './schedule/schedule.module';
import { SubjectsModule } from './subjects/subjects.module';
import { TeachersModule } from './teachers/teachers.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [EnvConfiguration],
      validationSchema: JoiValidationSchema,
    }),

    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('databaseHost'),
          port: configService.get<number>('databasePort'),
          username: configService.get<string>('databaseUsername'),
          database: configService.get<string>('databaseDatabase'),
          password: configService.get<string>('databasePassword'),
          autoLoadEntities: true,
          synchronize: true,
        };
      },
      inject: [ConfigService],
    }),

    TeachersModule,
    CommonModule,
    SubjectsModule,
    FacultyModule,
    ClassroomModule,
    ScheduleModule,
    AuthModule,
    UsersModule,
    OptimizerModule,
  ],

  controllers: [],
  providers: [],
})
export class AppModule {}
