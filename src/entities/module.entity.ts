import { Entity, PrimaryGeneratedColumn, Column, ManyToMany } from 'typeorm'
import { User } from './user.entity'

@Entity({ name: 'Module' })
export class Module {
  @PrimaryGeneratedColumn()
  moduleid: number

  @Column()
  mname: string

  @ManyToMany((type) => User, (user) => user.modules, {
    onUpdate: 'NO ACTION',
    onDelete: 'CASCADE',
    nullable: false,
  })
  users: User[]
}
