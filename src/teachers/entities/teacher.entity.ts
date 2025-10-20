import { Faculty } from 'src/faculty/entities/faculty.entity';
import {
  Column,
  CreateDateColumn,
  Entity,
  ManyToOne,
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

  @ManyToOne(() => Faculty, (faculty) => faculty.teacher)
  faculty: Faculty;
}
