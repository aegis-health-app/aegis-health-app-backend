import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'EmotionalRecord' })
export class EmotionalRecord {
  @PrimaryColumn({ type: 'date' })
  date;

  @Column({length: 1})
  emotionalLevel: string;

  @ManyToOne(() => User, (user) => user.emotionalRecords, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;
}
