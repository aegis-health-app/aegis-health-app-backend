import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  OneToMany,
  ManyToOne,
} from 'typeorm';
import { Memory_Practice_Answers } from './memoryPracticeAnswer.entity';
import { Users } from './user.entity';

@Entity()
export class Memory_Practice_Questions {
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

  @ManyToOne(() => Users, (users) => users.memory_practice_questions, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  users: Users;

  @OneToMany(
    () => Memory_Practice_Answers,
    (memory_practice_answers) =>
      memory_practice_answers.memory_practice_questions,
  )
  memory_practice_answers: Memory_Practice_Answers[];
}
