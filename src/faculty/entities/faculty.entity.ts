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
import { Subject } from 'src/subjects/entities/subject.entity';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  facultyName: string;

  @Column({ default: true })
  active: boolean;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => Teacher, (teacher) => teacher.faculty, { cascade: true })
  teachers: Teacher[];

  @OneToMany(() => Classroom, (classroom) => classroom.faculty, {
    cascade: true,
  })
  classroom: Classroom[];

  @OneToMany(() => Subject, (subject) => subject.faculty)
  subjects: Subject[];
}
