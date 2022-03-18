import { Entity, ManyToOne, Column, JoinColumn, PrimaryColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({ name: 'Emotional_Record' })
export class Emotional_Record {
  @PrimaryColumn({ type: 'date' })
  date;

  @Column()
  emotional_level: string;

  @ManyToOne(() => User, (user) => user.emotional_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;
}
