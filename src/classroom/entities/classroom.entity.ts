import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Schedule } from 'src/schedule/entities/schedule.entity';
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
export class Classroom {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  capacity: number;

  @Column({
    type: 'enum',
    enum: ['AVAILABLE', 'MAINTENANCE'],
    default: 'AVAILABLE',
  })
  status: 'AVAILABLE' | 'MAINTENANCE';

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToOne(() => Faculty, (faculty) => faculty.classroom)
  faculty: Faculty;

  @OneToMany(() => Schedule, (schedule) => schedule.classroom)
  schedules: Schedule[];
}
