import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { HealthData } from './healthData.entity';
import { HealthRecord } from './healthRecord.entity';

@Entity({ name: 'HealthColumn' })
export class HealthColumn {
  @PrimaryColumn()
  uid: number;

  @PrimaryColumn()
  hrName: string;

  @PrimaryColumn()
  columnName: string;

  @Column()
  unit: string;

  @ManyToOne(
    () => HealthRecord,
    (healthRecord) => healthRecord.healthColumns,
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
  ])
  healthRecord: HealthRecord;

  @OneToMany(() => HealthData, (healthData) => healthData.healthColumn)
  healthData: HealthData[];
}
