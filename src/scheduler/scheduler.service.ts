import { Injectable } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { RecurringInterval, RecurringOption, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleJob(schedule: Schedule, callback: () => void) {
    const name = `${schedule.name}-timeout`;
    if (schedule.startAt.getTime() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    if (this.schedulerRegistry.getTimeouts().find((timeoutName) => timeoutName === name)) this.schedulerRegistry.deleteTimeout(name);
    const timeDiff = moment(schedule.startAt).diff(moment(), 'milliseconds');
    let jobCallback = callback;
    if (schedule.recursion || schedule.customRecursion) {
      jobCallback = this.addRecurringJob(schedule, callback);
    }

    const timeout = setTimeout(jobCallback, timeDiff);
    this.schedulerRegistry.addTimeout(name, timeout);
  }
  private addRecurringJob(schedule: Schedule, callback: () => void) {
    const name = `${schedule.name}-recurring`;
    if (this.schedulerRegistry.getCronJobs().has(name)) this.schedulerRegistry.deleteCronJob(name);
    const cronExp = schedule.customRecursion ?? this.getCronExpression(schedule.recursion, schedule.startAt);
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
