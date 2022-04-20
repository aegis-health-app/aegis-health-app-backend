import { Injectable } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { RecurringInterval, Recursion, RecursionPeriod, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleRecurringJob(schedule: Schedule, callback: () => void) {
    const now = moment().utcOffset(420);
    if (schedule.startDate.getTime() < now.milliseconds()) throw new RangeError('Invalid Date: date should be after present');
    const job = this.addRecurringJob(schedule, callback);
    this.scheduleJob(schedule.name, schedule.startDate, () => {
      if (schedule.recursion && schedule.recursion.days) {
        //handle start day doesn't match recurring pattern
        const cronExpArray = this.getCustomCronExpression(schedule.recursion, schedule.startDate).split(' ');
        const IsStartDayMatchCron = this.toCsvString(schedule.recursion.days) === cronExpArray[cronExpArray.length - 1];
        if (IsStartDayMatchCron) callback();
      } else callback();
      job.start();
    });
  }
  scheduleJob(jobName: string, startDate: Date, callback: () => void) {
    const now = moment().utcOffset(420);
    if (startDate.getTime() < now.milliseconds()) throw new RangeError('Invalid Date: date should be after present');
    const name = `${jobName}-timeout`;
    const timeDiff = moment(startDate).diff(moment().utcOffset(420), 'milliseconds');
    this.addTimeout(name, timeDiff, callback);
  }
  private addTimeout(name: string, ms: number, callback: () => void) {
    const timeout = setTimeout(callback, ms);
    if (this.schedulerRegistry.getTimeouts().find((timeoutName) => timeoutName === name)) this.schedulerRegistry.deleteTimeout(name);
    this.schedulerRegistry.addTimeout(name, timeout);
  }
  private addRecurringJob({ name, predefined, recursion, startDate }: Schedule, callback: () => void) {
    const jobId = `${name}-recurring`;
    if (this.schedulerRegistry.getCronJobs().has(jobId)) this.schedulerRegistry.deleteCronJob(jobId);
    const cronExp = predefined ? this.getPredefinedCronExpression(predefined, startDate) : this.getCustomCronExpression(recursion, startDate);
    const job = new CronJob(cronExp, callback);
    this.schedulerRegistry.addCronJob(jobId, job);
    return job;
  }
  private getPredefinedCronExpression(interval: RecurringInterval, date: Date): string {
    let exp = '';
    switch (interval) {
      case RecurringInterval.EVERY_DAY:
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * *`;
        break;
      case RecurringInterval.EVERY_MONTH:
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()} * *`;
        break;
      case RecurringInterval.EVERY_WEEK:
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * ${date.getDay()}`;
        break;
      case RecurringInterval.EVERY_10_MINUTES:
        exp = CronExpression.EVERY_10_MINUTES;
      default:
        throw new Error('Invalid Enum value: RecurringInterval');
    }
    return exp;
  }
  private toCsvString(arr: any[]) {
    const tempArr = arr.map((v) => v.toString());
    return tempArr.reduce((acc, curr) => `${acc},${curr}`);
  }
  private getCustomCronExpression(custom: Recursion, date: Date): string {
    let exp = '';
    switch (custom.period) {
      case RecursionPeriod.MONTH:
        const dateRange = custom.dates ? this.toCsvString(custom.dates) : date.getDate();
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${dateRange} * *`;
        break;
      case RecursionPeriod.WEEK:
        const dayRange = custom.days ? this.toCsvString(custom.days) : date.getDay().toString();
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * ${dayRange}`;
        break;
      default:
        throw new Error('Invalid Enum value: RecursionPeriod');
    }
    return exp;
  }
}
