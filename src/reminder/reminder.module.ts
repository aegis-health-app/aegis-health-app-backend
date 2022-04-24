import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ReminderService } from './reminder.service';
import { ReminderController } from './reminder.controller';
import { Reminder } from 'src/entities/reminder.entity';
import { UserModule } from 'src/user/user.module';
import { Recurring } from 'src/entities/recurring.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Reminder, Recurring]), UserModule],
  providers: [ReminderService],
  controllers: [ReminderController]
})
export class ReminderModule {}