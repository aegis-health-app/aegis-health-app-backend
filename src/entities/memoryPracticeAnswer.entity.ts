import { Entity, CreateDateColumn, Column, ManyToOne, Timestamp, JoinColumn } from 'typeorm';
import { MemoryPracticeQuestion } from './memoryPracticeQuestion.entity';

@Entity({ name: 'MemoryPracticeAnswer' })
export class MemoryPracticeAnswer {
  @CreateDateColumn({ primary: true })
  timestamp: Timestamp;

  @Column()
  elderAnswer: string;

  @ManyToOne(() => MemoryPracticeQuestion, (memoryPracticeQuestion) => memoryPracticeQuestion.memoryPracticeAnswers, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'mid', referencedColumnName: 'mid' })
  memoryPracticeQuestion: MemoryPracticeQuestion;
}
