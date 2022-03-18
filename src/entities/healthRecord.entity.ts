import {
  Entity,
  PrimaryColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Health_Column } from './healthColumn.entity';
import { User } from './user.entity';

@Entity({ name: 'Health_Record' })
export class Health_Record {
  @PrimaryColumn()
  hr_name: string;

  @Column({ nullable: true })
  imageid: string;

  @PrimaryColumn()
  uid: number;

  @ManyToOne(() => User, (user) => user.health_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;

  @OneToMany(
    () => Health_Column,
    (health_column) => health_column.health_record,
  )
  health_columns: Health_Column[];
}
