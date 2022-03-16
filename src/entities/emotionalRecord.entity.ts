import { Entity, CreateDateColumn, ManyToOne, Column } from 'typeorm';
import { User } from './user.entity';

@Entity()
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
  user: User;

  // @PrimaryColumn()
  // uid: number;
}
