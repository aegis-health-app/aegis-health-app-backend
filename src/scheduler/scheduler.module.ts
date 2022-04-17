import { Module } from '@nestjs/common';
import { ScheduleModule } from '@nestjs/schedule';
import { ScheduleController } from './scheduler.controller';
import { SchedulerService } from './scheduler.service';

@Module({
  controllers: [ScheduleController],
  imports: [ScheduleModule.forRoot()],
  providers: [SchedulerService],
  exports: [SchedulerService],
})
export class SchedulerModule {}
