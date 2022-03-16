import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Health_Column } from './healthColumn.entity';
import { User } from './user.entity';

@Entity()
export class Health_Record {
  @PrimaryColumn()
  hr_name: string;

  @Column({ nullable: true })
  imageid: string;

  @Column()
  uid: string;

  @ManyToOne(() => User, (user) => user.health_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  user: User;

  @OneToMany(
    () => Health_Column,
    (health_column) => health_column.health_record,
  )
  health_columns: Health_Column[];
}
