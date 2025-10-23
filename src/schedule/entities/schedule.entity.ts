import { Classroom } from 'src/classroom/entities/classroom.entity';
import { Faculty } from 'src/faculty/entities/faculty.entity';
import { Subject } from 'src/subjects/entities/subject.entity';
import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Schedule {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  day: string;

  @Column()
  startTime: string;

  @Column()
  endTime: string;

  @ManyToOne(() => Subject, (subject) => subject.schedules, {
    eager: true,
    onDelete: 'CASCADE',
  })
  subject: Subject;

  @ManyToOne(() => Classroom, (classroom) => classroom.schedules, {
    eager: true,
    onDelete: 'CASCADE',
  })
  classroom: Classroom;

  @ManyToOne(() => Faculty, (faculty) => faculty.classroom, {
    eager: true,
    onDelete: 'CASCADE',
  })
  faculty: Faculty;
}
