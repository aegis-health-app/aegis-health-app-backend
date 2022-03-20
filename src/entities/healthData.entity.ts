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
  columnId: number;

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
    { name: 'columnId', referencedColumnName: 'columnId' },
    { name: 'hrName', referencedColumnName: 'hrName' },
    { name: 'uid', referencedColumnName: 'uid' },
  ])
  healthColumn: HealthColumn;
}
