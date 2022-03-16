import { Entity, CreateDateColumn, Column, ManyToOne, Timestamp } from 'typeorm';
import { Memory_Practice_Question } from './memoryPracticeQuestion.entity';

@Entity()
export class Memory_Practice_Answer {
  @CreateDateColumn({ primary: true })
  timestamp: Timestamp;

  @Column()
  elder_answer: string;

  // @Column()
  // mid: number

  @ManyToOne(
    () => Memory_Practice_Question,
    (memory_practice_question) =>
      memory_practice_question.memory_practice_answers,
    {
      onUpdate: 'NO ACTION',
      onDelete: 'CASCADE',
      nullable: false,
      primary: true,
    },
  )
  memory_practice_question: Memory_Practice_Question;
}
