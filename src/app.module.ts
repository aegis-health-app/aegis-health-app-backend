import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamplesModule } from './examples/examples.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DBHOST,
      port: 3306,
      username: process.env.DBUSERNAME,
      password: process.env.DBPASSWORD,
      database: 'aegis',
      entities: ['dist/**/*.entity{.ts,.js}'],
      synchronize: true,
    }),
    ExamplesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
