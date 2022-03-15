// import {Entity, PrimaryGeneratedColumn, Column, ManyToOne, OneToMany} from 'typeorm'
// import { Recurrings } from './recurring.entity';
// import { Users } from './user.entity';

// @Entity()
// export class Reminders {
//   @PrimaryGeneratedColumn()
//   rid: number;

//   @Column()
//   starting_timestamp: Date;

//   @Column()
//   title: string;

//   @Column({ nullable: true })
//   note: string;

//   @Column()
//   is_remind_caretaker: boolean;

//   @Column()
//   importance_level: string;

//   @Column({ nullable: true })
//   imageid: string;

//   @Column()
//   is_done: boolean;

//   @ManyToOne(() => Users, (users) => users.reminders, {
//     onDelete: 'CASCADE',
//     onUpdate: 'NO ACTION',
//     nullable: false,
//   })
//   users: Users;

//   @OneToMany(() => Recurrings, (recurrings) => recurrings.reminders)
//   recurrings: Recurrings[];
// }