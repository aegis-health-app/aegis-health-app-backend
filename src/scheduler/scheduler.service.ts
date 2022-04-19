import { Injectable } from '@nestjs/common';
import { SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { RecurringInterval, Recursion, RecursionPeriod, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleRecurringJob(schedule: Schedule, callback: () => void) {
    if (schedule.startDate.getTime() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    const job = this.addRecurringJob(schedule, callback);
    if (schedule.recursion?.period === RecursionPeriod.WEEK && schedule.recursion.repeat > 1) {
      const endOfWeekFromStartDate = moment(schedule.startDate).endOf('isoWeek');
      const rescheduleJob = () => {
        const nextInterval = moment(endOfWeekFromStartDate)
          .add((schedule.recursion.repeat - 1) * 604800000)
          .toDate();
        this.schedulerRegistry.deleteCronJob(`${schedule.name}-recurring`);
        this.scheduleRecurringJob({ ...schedule, startDate: nextInterval }, callback);
      };
      this.addTimeout(`${schedule.name}-reschedule-timeout`, moment().diff(endOfWeekFromStartDate, 'milliseconds'), rescheduleJob);
    }
    job.start();
  }
  scheduleJob(jobName: string, startDate: Date, callback: () => void) {
    if (startDate.getTime() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    const name = `${jobName}-timeout`;
    const timeDiff = moment(startDate).diff(moment(), 'milliseconds');
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
      case RecurringInterval.EVERY_YEAR:
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()} ${date.getMonth()} ${date.getDay()}`;
        break;
      default:
        throw new Error('Invalid Enum value: RecurringInterval');
    }
    return exp;
  }
  private getCustomCronExpression(custom: Recursion, date: Date): string {
    let exp = '';
    switch (custom.period) {
      case RecursionPeriod.MONTH:
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${date.getDate()} */${custom.repeat} *`;
        break;
      case RecursionPeriod.WEEK:
        const tempArr = custom.days?.map((v) => v.toString());
        const dayRange = tempArr ? tempArr.reduce((acc, curr) => `${acc},${curr}`) : date.getDay().toString();
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * ${dayRange}`;
        break;
      default:
        throw new Error('Invalid Enum value: RecursionPeriod');
    }
    return exp;
  }
}
