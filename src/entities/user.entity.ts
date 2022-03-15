// import {Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable} from 'typeorm'
// import { Emotional_Records } from './emotionalRecord.entity';
// import { Health_Records } from './healthRecord.entity';
// import { Memory_Practice_Answers } from './memoryPracticeAnswer.entity';
// import { Memory_Practice_Questions } from './memoryPracticeQuestion.entity';
// import { Modules } from './module.entity';
// import { Reminders } from './reminder.entity';

// @Entity()
// export class Users {
//   @PrimaryGeneratedColumn()
//   uid: number;

//   @Column()
//   phone: string;

//   @Column()
//   password: string;

//   @Column({ nullable: true })
//   imageid: string;

//   @Column()
//   fname: string;

//   @Column()
//   lname: string;

//   @Column({ nullable: true })
//   dname: string;

//   @Column()
//   bday: Date;

//   @Column()
//   gender: string;

//   @Column()
//   is_elderly: boolean;

//   @ManyToMany(() => Users, (Responsible_For) => Responsible_For.is_elderly)
//   Responsible_For: Users[];

//   @OneToMany(() => Reminders, (reminder) => reminder.users)
//   reminders: Reminders[];

//   @OneToMany(
//     () => Emotional_Records,
//     (emotional_records) => emotional_records.users,
//   )
//   emtional_records: Emotional_Records[];

//   @OneToMany(
//     () => Memory_Practice_Questions,
//     (memory_practice_questions) => memory_practice_questions.users,
//   )
//   memory_practice_questions: Memory_Practice_Answers[];

//   @OneToMany(() => Health_Records, (health_records) => health_records.users)
//   health_records: Health_Records[];

//   @ManyToMany(type => Modules, modules => modules.users)
//   @JoinTable()
//   modules: Modules[]
// }

