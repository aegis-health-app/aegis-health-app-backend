import {
  Entity,
  CreateDateColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
} from 'typeorm';
import { Health_Columns } from './healthColumn.entity';

@Entity()
export class Health_Data {
  @CreateDateColumn({ primary: true })
  timestamp: Date;

  @Column('double')
  value: number;

  @PrimaryColumn()
  column_id: number;

  @PrimaryColumn()
  hr_name: string;

  //   @Column()
  //   uid: string;

  @ManyToOne(
    () => Health_Columns,
    (health_columns) => health_columns.health_data,
    {
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
      nullable: false,
      primary: true,
    },
  )
  health_columns: Health_Columns;
}
