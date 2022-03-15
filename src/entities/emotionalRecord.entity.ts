// import {Entity, CreateDateColumn, ManyToOne, Column} from 'typeorm'
// import { Users } from './user.entity';

// @Entity()
// export class Emotional_Records {
//   @CreateDateColumn()
//   timestamp: Date;

//   @Column()
//   emotional_level: string;

//   @ManyToOne(() => Users, (users) => users.emtional_records, {
//     onUpdate: 'NO ACTION',
//     onDelete: 'CASCADE',
//     nullable: false,
//   })
//   users: Users;

//   // @PrimaryColumn()
//   // uid: number;
// }