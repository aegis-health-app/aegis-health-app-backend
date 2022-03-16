import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToMany,
  JoinTable,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Emotional_Records } from './emotionalRecord.entity';
import { Health_Records } from './healthRecord.entity';
import { Memory_Practice_Answers } from './memoryPracticeAnswer.entity';
import { Memory_Practice_Questions } from './memoryPracticeQuestion.entity';
import { Modules } from './module.entity';
import { Multiple_Choice_Questions } from './multipleChoiceQuestion.entity';
import { Reminders } from './reminder.entity';

@Entity()
export class Users {
  @PrimaryGeneratedColumn()
  uid: number;

  @Column({unique: true})
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

  @Column()
  bday: Date;

  @Column()
  gender: string;

  @Column()
  is_elderly: boolean;

  @OneToMany(() => Reminders, (reminder) => reminder.users)
  reminders: Reminders[];

  @OneToMany(
    () => Emotional_Records,
    (emotional_records) => emotional_records.users,
  )
  emtional_records: Emotional_Records[];

  @OneToMany(
    () => Memory_Practice_Questions,
    (memory_practice_questions) => memory_practice_questions.users,
  )
  memory_practice_questions: Memory_Practice_Answers[];

  @OneToMany(() => Health_Records, (health_records) => health_records.users)
  health_records: Health_Records[];

  @ManyToMany((type) => Modules, (modules) => modules.users)
  @JoinTable({name: 'Selected'})
  modules: Modules[];

  @ManyToMany((type) => Users, (taking_care_of) => taking_care_of.taken_care_by)
  @JoinTable({name: 'Responsible_For'})
  taking_care_of: Users[];

  @ManyToMany(type => Users, (taken_care_by) => taken_care_by.taking_care_of)
  taken_care_by: Users[];

  @OneToOne(() => Multiple_Choice_Questions)
  @JoinColumn()
  multiple_choice_questions: Multiple_Choice_Questions;
}
