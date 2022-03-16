import {
  Entity,
  CreateDateColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
} from 'typeorm';
import { Health_Column } from './healthColumn.entity';

@Entity()
export class Health_Data {
  @CreateDateColumn({ primary: true })
  timestamp: Timestamp;

  @Column('double')
  value: number;

  @PrimaryColumn()
  column_id: number;

  @PrimaryColumn()
  hr_name: string;

  //   @Column()
  //   uid: string;

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
  health_column: Health_Column;
}
