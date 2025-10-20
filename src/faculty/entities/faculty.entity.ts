import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Teacher } from '../../teachers/entities/teacher.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  facultyName: string;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Teacher, (teacher) => teacher.faculty, { cascade: true })
  teacher: Teacher[];

  @OneToMany(() => Classroom, (classroom) => classroom.faculty, {
    cascade: true,
  })
  classroom: Classroom[];
}
