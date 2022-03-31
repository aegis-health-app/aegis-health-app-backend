import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToMany, JoinTable } from 'typeorm';
import { EmotionalRecord } from './emotionalRecord.entity';
import { HealthRecord } from './healthRecord.entity';
import { MemoryPracticeAnswer } from './memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from './memoryPracticeQuestion.entity';
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

  @Column({ type: 'date' })
  bday: Date;

  @Column()
  gender: string;

  @Column()
  isElderly: boolean;

  @Column({ nullable: true })
  healthCondition: string;

  @Column({ nullable: true, length: 2 })
  bloodType: string;

  @Column({ nullable: true })
  personalMedication: string;

  @Column({ nullable: true })
  allergy: string;

  @Column({ nullable: true })
  vaccine: string;

  @OneToMany(() => Reminder, (reminder) => reminder.user)
  reminders: Reminder[];

  @OneToMany(() => EmotionalRecord, (emotionalRecord) => emotionalRecord.user)
  emotionalRecords: EmotionalRecord[];

  @OneToMany(() => MemoryPracticeQuestion, (memoryPracticeQuestion) => memoryPracticeQuestion.users)
  memoryPracticeQuestions: MemoryPracticeAnswer[];

  @OneToMany(() => HealthRecord, (healthRecord) => healthRecord.user)
  healthRecords: HealthRecord[];

  @ManyToMany((type) => Module, (module) => module.users, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinTable({
    name: 'Selected',
    joinColumn: { name: 'uid', referencedColumnName: 'uid' },
    inverseJoinColumn: { name: 'moduleid', referencedColumnName: 'moduleid' },
  })
  modules: Module[];

  @ManyToMany((type) => User, (takingCareOf) => takingCareOf.takenCareBy, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinTable({
    name: 'ResponsibleFor',
    joinColumn: { name: 'uidCaretaker', referencedColumnName: 'uid' },
    inverseJoinColumn: { name: 'uidElderly', referencedColumnName: 'uid' },
  })
  takingCareOf: User[];

  @ManyToMany((type) => User, (takenCareBy) => takenCareBy.takingCareOf, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  takenCareBy: User[];
}
