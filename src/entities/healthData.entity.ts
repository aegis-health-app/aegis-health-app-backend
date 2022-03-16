import {
  Entity,
  CreateDateColumn,
  Column,
  ManyToOne,
  PrimaryColumn,
  Timestamp,
  JoinColumn,
} from 'typeorm';
import { Health_Column } from './healthColumn.entity';

@Entity({name: 'Health_Data'})
export class Health_Data {
  @CreateDateColumn({ primary: true })
  timestamp: Timestamp;

  @Column('double')
  value: number;

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
  // @JoinColumn([{name: 'column_id', referencedColumnName: ''}, {name: 'hr_name'}, {name: 'uid'}])
  health_column: Health_Column;
}
