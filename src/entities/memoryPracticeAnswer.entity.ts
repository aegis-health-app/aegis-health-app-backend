// import {Entity, CreateDateColumn, Column, ManyToOne} from 'typeorm'
// import { Memory_Practice_Questions } from './memoryPracticeQuestion.entity';

// @Entity()
// export class Memory_Practice_Answers {
//   @CreateDateColumn()
//   timestamp: Date;

//   @Column()
//   elder_answer: string;

//   // @Column()
//   // mid: number

//   @ManyToOne(
//     () => Memory_Practice_Questions,
//     (memory_practice_questions) =>
//       memory_practice_questions.memory_practice_answers,
//     { onUpdate: 'NO ACTION', onDelete: 'CASCADE', nullable: false },
//   )
//   memory_practice_questions: Memory_Practice_Questions;
// }