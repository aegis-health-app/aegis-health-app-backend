import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
} from 'typeorm';
import { Emotional_Record } from './emotionalRecord.entity';
import { Health_Record } from './healthRecord.entity';
import { Memory_Practice_Answer } from './memoryPracticeAnswer.entity';
import { Memory_Practice_Question } from './memoryPracticeQuestion.entity';
import { Module } from './module.entity';
import { Reminder } from './reminder.entity';

@Entity({ name: 'User' })
export class User {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({ unique: true, length: 10 })
  phone: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  imageid: string;

  @Column()
  fname: string;

  @Column()
  lname: string;

  @Column({ nullable: true })
  dname: string;

  @Column({type: "date"})
  bday: Date;

  @Column()
  gender: string;

  @Column()
  is_elderly: boolean;

  @Column({ nullable: true })
  health_condition: string;

  @Column({ nullable: true })
  blood_type: string;

  @Column({ nullable: true })
  personal_medication: string;

  @Column({ nullable: true })
  allergy: string;

  @Column({ nullable: true })
  vaccine: string;

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(
    () => Emotional_Record,
    (emotional_record) => emotional_record.user,
  )
  emotional_records: Emotional_Record[];

  @OneToMany(
    () => Memory_Practice_Question,
    (memory_practice_question) => memory_practice_question.users,
  )
  memory_practice_questions: Memory_Practice_Answer[];

  @OneToMany(() => Health_Record, (health_record) => health_record.user)
  health_records: Health_Record[];

  @ManyToMany((type) => Module, (module) => module.users)
  @JoinTable({
    name: 'Selected',
    joinColumn: { name: 'uid', referencedColumnName: 'uid' },
    inverseJoinColumn: { name: 'moduleid', referencedColumnName: 'moduleid' },
  })
  modules: Module[];

  @ManyToMany((type) => User, (taking_care_of) => taking_care_of.taken_care_by)
  @JoinTable({
    name: 'Responsible_For',
    joinColumn: { name: 'uid_elderly', referencedColumnName: 'uid' },
    inverseJoinColumn: { name: 'uid_caretaker', referencedColumnName: 'uid' },
  })
  taking_care_of: User[];

  @ManyToMany((type) => User, (taken_care_by) => taken_care_by.taking_care_of)
  taken_care_by: User[];
}
