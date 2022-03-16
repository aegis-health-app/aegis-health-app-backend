import { Entity, CreateDateColumn, ManyToOne, Column } from 'typeorm';
import { Users } from './user.entity';

@Entity()
export class Emotional_Records {
  @CreateDateColumn({ primary: true })
  date: Date;

  @Column()
  emotional_level: string;

  @ManyToOne(() => Users, (users) => users.emtional_records, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
    primary: true,
  })
  users: Users;

  // @PrimaryColumn()
  // uid: number;
}
