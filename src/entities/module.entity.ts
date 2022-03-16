import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm';
import { Users } from './user.entity';

@Entity()
export class Modules {
  @PrimaryGeneratedColumn()
  moduleid: number;

  @Column()
  mname: string;

  @ManyToMany((type) => Users, (users) => users.modules)
  users: Users[];
}
