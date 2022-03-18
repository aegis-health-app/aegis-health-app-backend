import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { Memory_Practice_Question } from './memoryPracticeQuestion.entity';

@Entity({ name: 'Multiple_Choice_Question' })
export class Multiple_Choice_Question {
  @Column()
  choice1: string;

  @Column()
  choice2: string;

  @Column()
  choice3: string;

  @Column()
  choice4: string;

  @Column()
  correct_answer: string;

  @PrimaryColumn()
  mid: string;

  @OneToOne(
    () => Memory_Practice_Question,
    (memory_practice_question) =>
      memory_practice_question.multiple_choice_question,
    { primary: true, onUpdate: 'NO ACTION', onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'mid', referencedColumnName: 'mid' })
  memory_practice_question: Memory_Practice_Question;
}
