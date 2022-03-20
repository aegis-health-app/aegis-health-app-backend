import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reminder } from './reminder.entity';

@Entity({name: 'Recurring'})
export class Recurring {
  @PrimaryColumn({ default: 0 })
  recurring_date_of_month: number;

  @PrimaryColumn({ default: 0})
  recurring_day: number;

  @PrimaryColumn({type: "time"})
  recurring_time

  @ManyToOne(() => Reminder, (reminder) => reminder.recurrings, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({name: 'rid', referencedColumnName: 'rid'})
  reminder: Reminder;
}
