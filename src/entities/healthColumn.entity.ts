import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
} from 'typeorm';
import { Health_Data } from './healthData.entity';
import { Health_Record } from './healthRecord.entity';

@Entity()
export class Health_Column {
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
    () => Health_Record,
    (health_record) => health_record.health_columns,
    {
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
      nullable: false,
      primary: true,
    },
  )
  health_record: Health_Record;

  @OneToMany(() => Health_Data, (health_data) => health_data.health_column)
  health_data: Health_Data[];
}
