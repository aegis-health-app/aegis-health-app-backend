import { Entity, CreateDateColumn, ManyToOne, Column, JoinColumn } from 'typeorm';
import { User } from './user.entity';

@Entity({name: 'Emotional_Record'})
export class Emotional_Record {
  @CreateDateColumn({ primary: true })
  date: Date;

  @Column()
  emotional_level: string;

  @ManyToOne(() => User, (user) => user.emtional_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  @JoinColumn({ name: 'uid', referencedColumnName: 'uid' })
  user: User;

  // @PrimaryColumn()
  // uid: number;
}
