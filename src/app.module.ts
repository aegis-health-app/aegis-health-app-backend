import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ExamplesModule } from './examples/examples.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { SettingController } from './setting/setting.controller';
import { SettingService } from './setting/setting.service';
import { SettingModule } from './setting/setting.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true
    }),
    TypeOrmModule.forRootAsync({
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DBHOST,
        port: 3306,
        username: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: 'aegis',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: true,
      }),
    }),
    SettingModule,
  ],
  controllers: [AppController, SettingController],
  providers: [AppService, SettingService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
