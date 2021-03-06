import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Connection } from 'typeorm';
import { UserModule } from './user/user.module';
import { HomeModule } from './home/home.module';
import { OtpModule } from './otp/otp.module';
import { LinkModule } from './link/link.module';
import { SettingModule } from './setting/setting.module';
import { EmotionTrackingModule } from './emotion-tracking/emotion-tracking.module';
import { HealthRecordModule } from './healthRecord/healthRecord.module';
import { EmergencyModule } from './notification/emergency/emergency.module';
import { NotificationModule } from './notification/notification.module';
import { SchedulerModule } from './scheduler/scheduler.module';
import { MemoryPracticeModule } from './memoryPractice/memoryPractice.module';
import { ReminderModule } from './reminder/reminder.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: () => ({
        type: 'mysql',
        host: process.env.DBHOST,
        port: 3306,
        username: process.env.DBUSERNAME,
        password: process.env.DBPASSWORD,
        database: 'aegis',
        entities: ['dist/**/*.entity{.ts,.js}'],
        synchronize: false,
      }),
    }),
    HomeModule,
    OtpModule,
    UserModule,
    LinkModule,
    SettingModule,
    EmotionTrackingModule,
    HealthRecordModule,
    EmergencyModule,
    NotificationModule,
    SchedulerModule,
    MemoryPracticeModule,
    ReminderModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  constructor(private connection: Connection) {}
}
