import { Injectable } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { RecurringInterval, RecurringOption, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleJob(schedule: Schedule, callback: () => void) {
    const timeDiff = moment(schedule.startAt).diff(moment(), 'milliseconds');
    const jobCallback = this.addRecurringJob(schedule, callback);
    const timeout = setTimeout(jobCallback, timeDiff);
    const name = `${schedule.name}-timeout`;
    this.schedulerRegistry.addTimeout(name, timeout);
  }
  private addRecurringJob(schedule: Schedule, callback: () => void) {
    const name = `${schedule.name}-recurring`;
    const cronExp = schedule.recurringOption.custom ?? this.getCronExpression(schedule.recurringOption.recurring, schedule.startAt);
    const job = new CronJob(cronExp, callback);
    this.schedulerRegistry.addCronJob(name, job);
    return () => job.start();
  }
  private getCronExpression(interval: RecurringInterval, date: Date): string {
    let exp = '';
    switch (interval) {
      case RecurringInterval.EVERY_DAY:
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * *`;
      case RecurringInterval.EVERY_MONTH:
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()} * *`;
      case RecurringInterval.EVERY_WEEK:
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * ${date.getDay()}`;
    }
    return exp;
  }
}
