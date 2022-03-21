import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToOne,
  JoinColumn,
  PrimaryColumn,
} from 'typeorm';
import { MemoryPracticeQuestion } from './memoryPracticeQuestion.entity';

@Entity({ name: 'MultipleChoiceQuestion' })
export class MultipleChoiceQuestion {
  @Column()
  choice1: string;

  @Column()
  choice2: string;

  @Column()
  choice3: string;

  @Column()
  choice4: string;

  @Column()
  correctAnswer: string;

  @PrimaryColumn()
  mid: string;

  @OneToOne(
    () => MemoryPracticeQuestion,
    (memoryPracticeQuestion) =>
      memoryPracticeQuestion.multipleChoiceQuestion,
    { primary: true, onUpdate: 'NO ACTION', onDelete: 'CASCADE' },
  )
  @JoinColumn({ name: 'mid', referencedColumnName: 'mid' })
  memoryPracticeQuestion: MemoryPracticeQuestion;
}
