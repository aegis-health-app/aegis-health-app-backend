import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Memory_Practice_Answer } from './memoryPracticeAnswer.entity';
import { Multiple_Choice_Question } from './multipleChoiceQuestion.entity';
import { User } from './user.entity';

@Entity()
export class Memory_Practice_Question {
  @PrimaryGeneratedColumn()
  mid: string;

  @Column()
  question: string;

  @Column()
  is_selected: boolean;

  @Column({ nullable: true })
  imageid: string;

  // @Column()
  // uid: string;

  @ManyToOne(() => User, (user) => user.memory_practice_questions, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  users: User;

  @OneToMany(
    () => Memory_Practice_Answer,
    (memory_practice_answer) =>
      memory_practice_answer.memory_practice_question,
  )
  memory_practice_answers: Memory_Practice_Answer[];

  // @OneToMany(
  //   () => Multiple_Choice_Questions,
  //   (multiple_choice_questions) => multiple_choice_questions.memory_practice_questions
  // )
  // multiple_choice_questions: Multiple_Choice_Questions;

  @OneToOne(() => Multiple_Choice_Question)
  @JoinColumn()
  multiple_choice_question: Multiple_Choice_Question;
}
