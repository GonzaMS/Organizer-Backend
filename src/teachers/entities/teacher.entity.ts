import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class Teacher {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'jsonb', nullable: true })
  availability: Record<string, string[]>;

  @Column({ default: true })
  active: boolean;

  @Column({ type: 'int', default: 20 })
  maxHoursPerWeek: number;

  @CreateDateColumn()
  createAt: Date;

  @UpdateDateColumn()
  updateAt: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.teachers)
  faculty: Faculty;

  @OneToMany(() => Subject, (subject) => subject.teacher)
  subjects: Subject[];
}
