import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { MemoryPracticeAnswer } from './memoryPracticeAnswer.entity';
import { MultipleChoiceQuestion } from './multipleChoiceQuestion.entity';
import { User } from './user.entity';

@Entity({ name: 'MemoryPracticeQuestion' })
export class MemoryPracticeQuestion {
  @PrimaryGeneratedColumn()
  mid: string;

  @Column()
  question: string;

  @Column()
  isSelected: boolean;

  @Column({ nullable: true })
  imageid: string;

  @ManyToOne(() => User, (user) => user.memoryPracticeQuestions, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  users: User;

  @OneToMany(
    () => MemoryPracticeAnswer,
    (memoryPracticeAnswer) => memoryPracticeAnswer.memoryPracticeQuestion,
  )
  memoryPracticeAnswers: MemoryPracticeAnswer[];

  @OneToOne(
    () => MultipleChoiceQuestion,
    (multipleChoiceQuestion) =>
      multipleChoiceQuestion.memoryPracticeQuestion,
  )
  multipleChoiceQuestion: MultipleChoiceQuestion;
}
