import { Entity, PrimaryColumn, ManyToOne } from 'typeorm';
import { Reminders } from './reminder.entity';

@Entity()
export class Recurrings {
  @PrimaryColumn({ default: 0 })
  recurring_date_of_month: number;

  @PrimaryColumn({ default: 0})
  recurring_day: number;

  @PrimaryColumn()
  recurring_time: string;

  @ManyToOne(() => Reminders, (reminders) => reminders.recurrings, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  reminders: Reminders;
}
