import { Module } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { SchedulerModule } from 'src/scheduler/scheduler.module';
import { NotificationModule } from 'src/notification/notification.module';
import { Reminder } from 'src/entities/reminder.entity';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GoogleModule } from 'src/google-cloud/google.module';
import { User } from 'src/entities/user.entity';

import { UserModule } from 'src/user/user.module';
import { Recurring } from 'src/entities/recurring.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, User, Recurring]), SchedulerModule, NotificationModule, GoogleModule, UserModule],
  controllers: [ReminderController],
  providers: [ReminderService],
})
export class ReminderModule {}
