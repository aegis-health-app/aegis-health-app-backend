import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Reminder } from './reminder.entity';

@Entity()
export class Recurring {
  @PrimaryColumn({ default: 0 })
  recurring_date_of_month: number;

  @PrimaryColumn({ default: 0})
  recurring_day: number;

  @PrimaryColumn()
  recurring_time: string;

  @ManyToOne(() => Reminder, (reminder) => reminder.recurrings, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  reminder: Reminder;
}
