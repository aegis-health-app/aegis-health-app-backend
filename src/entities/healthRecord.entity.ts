import { Entity, PrimaryColumn, Column, ManyToOne, OneToMany } from 'typeorm';
import { Health_Columns } from './healthColumn.entity';
import { Users } from './user.entity';

@Entity()
export class Health_Records {
  @PrimaryColumn()
  hr_name: string;

  @Column({ nullable: true })
  imageid: string;

  @Column()
  uid: string;

  @ManyToOne(() => Users, (users) => users.health_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  users: Users;

  @OneToMany(
    () => Health_Columns,
    (health_columns) => health_columns.health_records,
  )
  health_columns: Health_Columns[];
}
