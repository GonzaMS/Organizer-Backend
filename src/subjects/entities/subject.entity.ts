import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
import { Teacher } from 'src/teachers/entities/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Subject {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  code: string;

  @Column({ type: 'int' })
  weeklyHours: number;

  //TODO: Maybe do this for students in the future
  // @Column({ type: 'int' })
  // studentCount: number;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.subjects, {
    onDelete: 'CASCADE',
  })
  faculty: Faculty;

  @ManyToOne(() => Teacher, (teacher) => teacher.subjects, {
    onDelete: 'SET NULL',
  })
  teacher: Teacher;

  @OneToMany(() => Schedule, (schedule) => schedule.subject)
  schedules: Schedule[];
}
