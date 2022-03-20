import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { HealthColumn } from './healthColumn.entity';
import { User } from './user.entity';

@Entity({ name: 'HealthRecord' })
export class HealthRecord {
  @PrimaryColumn()
  hrName: string;

  @Column({ nullable: true })
  imageid: string;

  @PrimaryColumn()
  uid: number;

  @ManyToOne(() => User, (user) => user.healthRecords, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;

  @OneToMany(
    () => HealthColumn,
    (healthColumn) => healthColumn.healthRecord,
  )
  healthColumns: HealthColumn[];
}
