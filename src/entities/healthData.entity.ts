// import {Entity, CreateDateColumn, Column, ManyToOne} from 'typeorm'
// import { Health_Columns } from './healthColumn.entity';

// @Entity()
// export class Health_Data {
//   @CreateDateColumn()
//   timestamp: Date;

//   @Column('double')
//   value: number;

//   @Column()
//   column_id: number;

//   @Column()
//   hr_name: string;

//   //   @Column()
//   //   uid: string;

//   @ManyToOne(
//     () => Health_Columns,
//     (health_columns) => health_columns.health_data,
//     { onUpdate: 'NO ACTION', onDelete: 'CASCADE', nullable: false },
//   )
//   health_columns: Health_Columns;
// }