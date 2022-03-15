// import {Entity, PrimaryColumn, ManyToOne} from 'typeorm'
// import { Reminders } from './reminder.entity';

// @Entity()
// export class Recurrings {
//   @PrimaryColumn()
//   recurring_date_of_month: number;

//   @PrimaryColumn()
//   recurring_day: number;

//   @PrimaryColumn()
//   recurring_time: Date;

//   @ManyToOne(() => Reminders, (reminders) => reminders.recurrings, {
//     onUpdate: 'NO ACTION',
//     onDelete: 'CASCADE',
//     nullable: false,
//   })
//   reminders: Reminders;
// }