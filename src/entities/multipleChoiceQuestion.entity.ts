import { Entity, PrimaryGeneratedColumn, Column, OneToOne, JoinColumn } from 'typeorm';

@Entity({name: 'Multiple_Choice_Question'})
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
  memory_practice_questions: any;

  @PrimaryGeneratedColumn()
  mid: string;
}
