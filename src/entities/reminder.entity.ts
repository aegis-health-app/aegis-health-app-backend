import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';
import { Recurring } from './recurring.entity';
import { User } from './user.entity';

@Entity({name: 'Reminder'})
export class Reminder {
  @PrimaryGeneratedColumn()
  rid: number;

  @Column({type: "date"})
  starting_date: Date;

  @Column()
  title: string;

  @Column({ nullable: true })
  note: string;

  @Column()
  is_remind_caretaker: boolean;

  @Column({ default: 'Low'})
  importance_level: string;

  @Column({ nullable: true })
  imageid: string;

  @Column()
  is_done: boolean;

  @ManyToOne(() => User, (user) => user.reminders, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
    nullable: false,
  })
  @JoinColumn({name: 'uid', referencedColumnName: 'uid'})
  user: User;

  @OneToMany(() => Recurring, (recurring) => recurring.reminder)
  recurrings: Recurring[];
}
