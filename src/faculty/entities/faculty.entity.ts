import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Faculty {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  facultyName: string;
}
