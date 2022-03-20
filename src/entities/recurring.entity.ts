import { Entity, PrimaryColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Reminder } from './reminder.entity';

@Entity({name: 'Recurring'})
export class Recurring {
  @PrimaryColumn({ default: 0 })
  recurringDateOfMonth: number;

  @PrimaryColumn({ default: 0})
  recurringDay: number;

  @PrimaryColumn({type: "time"})
  recurringTime

  @ManyToOne(() => Reminder, (reminder) => reminder.recurrings, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({name: 'rid', referencedColumnName: 'rid'})
  reminder: Reminder;
}
