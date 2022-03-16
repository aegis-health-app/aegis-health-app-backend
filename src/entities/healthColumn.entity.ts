import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Health_Data } from './healthData.entity';
import { Health_Records } from './healthRecord.entity';

@Entity()
export class Health_Columns {
  @PrimaryGeneratedColumn()
  column_id: number;

  @Column()
  column_name: string;

  @Column()
  unit: string;

  @Column()
  hr_name: string;

  //   @Column()
  //   uid: number;

  @ManyToOne(
    () => Health_Records,
    (health_records) => health_records.health_columns,
    { onUpdate: 'NO ACTION', onDelete: 'CASCADE', nullable: false },
  )
  health_records: Health_Records;

  @OneToMany(() => Health_Data, (health_data) => health_data.health_columns)
  health_data: Health_Data[];
}
