import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany, JoinColumn, Timestamp } from 'typeorm';
import { Recurring } from './recurring.entity';
import { User } from './user.entity';

@Entity({ name: 'Reminder' })
export class Reminder {
  @PrimaryGeneratedColumn()
  rid: number;

  @Column({ type: 'datetime' })
  startingDateTime: Date;

  @Column()
  title: string;

  @Column({ nullable: true })
  note: string;

  @Column()
  isRemindCaretaker: boolean;

  @Column({ default: 'Low' })
  importanceLevel: string;

  @Column({ nullable: true })
  imageid: string;

  @Column()
  isDone: boolean;

  @ManyToOne(() => User, (user) => user.reminders, {
    onDelete: 'CASCADE',
    onUpdate: 'NO ACTION',
    nullable: false,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;

  @OneToMany(() => Recurring, (recurring) => recurring.reminder)
  recurrings: Recurring[];
}
