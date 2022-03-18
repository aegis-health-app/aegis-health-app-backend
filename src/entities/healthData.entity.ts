import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
  JoinColumn,
} from 'typeorm';
import { Health_Column } from './healthColumn.entity';

@Entity({ name: 'Health_Data' })
export class Health_Data {
  @PrimaryColumn({ type: 'datetime' })
  timestamp: Timestamp;

  @PrimaryColumn()
  column_id: number;

  @PrimaryColumn()
  uid: number;

  @PrimaryColumn()
  hr_name: string;

  @Column('float')
  value: number;

  @ManyToOne(
    () => Health_Column,
    (health_column) => health_column.health_data,
    {
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
      nullable: false,
      primary: true,
    },
  )
  @JoinColumn([
    { name: 'column_id', referencedColumnName: 'column_id' },
    { name: 'hr_name', referencedColumnName: 'hr_name' },
    { name: 'uid', referencedColumnName: 'uid' },
  ])
  health_column: Health_Column;
}
