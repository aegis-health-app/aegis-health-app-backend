import {
  Entity,
  Column,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
  JoinColumn,
} from 'typeorm';
import { HealthColumn } from './healthColumn.entity';

@Entity({ name: 'HealthData' })
export class HealthData {
  @PrimaryColumn({ type: 'datetime' })
  timestamp: Timestamp;

  @PrimaryColumn()
  columnName: string;

  @PrimaryColumn()
  uid: number;

  @PrimaryColumn()
  hrName: string;

  @Column('float')
  value: number;

  @ManyToOne(
    () => HealthColumn,
    (healthColumn) => healthColumn.healthData,
    {
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
      nullable: false,
      primary: true,
    },
  )
  @JoinColumn([
    { name: 'uid', referencedColumnName: 'uid' },
    { name: 'hrName', referencedColumnName: 'hrName' },
    { name: 'columnName', referencedColumnName: 'columnName' },
  ])
  healthColumn: HealthColumn;
}
