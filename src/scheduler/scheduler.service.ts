import { Injectable } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { RecurringInterval, Recursion, RecursionPeriod, Repetition, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleRecurringJob(schedule: Schedule, callback: () => void) {
    if (moment(schedule.startDate).utcOffset(0).milliseconds() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    const job = this.addRecurringJob(schedule, callback);
    this.scheduleJob(schedule.name, schedule.startDate, () => {
      if (schedule.customRecursion && schedule.customRecursion.days) {
        //handle start day doesn't match recurring pattern
        const cronExpArray = this.getCustomCronExpression(schedule.customRecursion, schedule.startDate).split(' ');
        const IsStartDayMatchCron = this.toCsvString(schedule.customRecursion.days) === cronExpArray[cronExpArray.length - 1];
        if (IsStartDayMatchCron) callback();
      } else callback();
      job.start();
    });
  }
  scheduleJob(jobName: string, startDate: Date, callback: () => void) {
    if (moment(startDate).utcOffset(0).milliseconds() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    const name = `${jobName}-timeout`;
    const timeDiff = moment(startDate).utcOffset(0).diff(moment(), 'milliseconds');
    this.addTimeout(name, timeDiff, callback);
  }
  scheduleInterval(jobName: string, startDate: Date, repetition: Repetition, callback: () => void) {
    if (moment(startDate).utcOffset(0).milliseconds() < Date.now()) throw new RangeError('Invalid Date: date should be after present');
    const name = `${jobName}-interval`;
    let iteration = 0;
    const intervalCallback = () => {
      callback();
      iteration++;
      if (repetition.maxIteration && iteration >= repetition.maxIteration) this.schedulerRegistry.deleteInterval(name);
    };
    this.scheduleJob(name, startDate, () => {
      const interval = setInterval(intervalCallback, repetition.interval);
      this.schedulerRegistry.addInterval(`${jobName}-interval-timeout`, interval);
    });
  }
  private addTimeout(name: string, ms: number, callback: () => void) {
    const timeout = setTimeout(callback, ms);
    try {
      this.schedulerRegistry.addTimeout(name, timeout);
    } catch (e) {
      this.schedulerRegistry.deleteTimeout(name);
      this.schedulerRegistry.addTimeout(name, timeout);
    }
    return timeout;
  }
  private addRecurringJob({ name, recursion, customRecursion, startDate }: Schedule, callback: () => void) {
    const jobId = `${name}-recurring`;
    const cronExp = recursion ? this.getPredefinedCronExpression(recursion, startDate) : this.getCustomCronExpression(customRecursion, startDate);
    const job = new CronJob(cronExp, callback);
    try {
      this.schedulerRegistry.addCronJob(jobId, job);
    } catch (e) {
      this.schedulerRegistry.deleteCronJob(jobId);
      this.schedulerRegistry.addCronJob(jobId, job);
    }
    return job;
  }
  deleteInterval(name: string) {
    try {
      this.schedulerRegistry.deleteInterval(`${name}-interval`);
      return true;
    } catch (e) {
      return false;
    }
  }
  clearJobs(name: string): void {
    //clear all jobs when deleting reminders
    if (this.schedulerRegistry.getIntervals().find((intervalName) => intervalName === `${name}-interval`))
      this.schedulerRegistry.deleteInterval(`${name}-interval`);
    if (this.schedulerRegistry.getCronJobs().has(`${name}-recurring`)) this.schedulerRegistry.deleteCronJob(`${name}-recurring`);
    this.schedulerRegistry.getTimeouts().forEach((timeoutName) => {
      if (timeoutName === `${name}-timeout` || timeoutName === `${name}-interval-timeout`) {
        this.schedulerRegistry.deleteTimeout(timeoutName);
      }
    });
  }
  private getPredefinedCronExpression(interval: RecurringInterval, date: Date): string {
    const dateUtc = moment(date).utcOffset(0).toDate();
    let exp = '';
    switch (interval) {
      case RecurringInterval.EVERY_DAY:
        exp = `0 ${dateUtc.getMinutes()} ${dateUtc.getHours()} * * *`;
        break;
      case RecurringInterval.EVERY_MONTH:
        exp = `0 ${dateUtc.getMinutes()} ${dateUtc.getHours()} ${dateUtc.getDate()} * *`;
        break;
      case RecurringInterval.EVERY_WEEK:
        exp = `0 ${dateUtc.getMinutes()} ${dateUtc.getHours()} * * ${dateUtc.getDay()}`;
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
  private getCustomCronExpression(recursion: Recursion, date: Date): string {
    const dateUtc = moment(date).utcOffset(0).toDate();
    let exp = '';
    switch (recursion.period) {
      case RecursionPeriod.MONTH:
        const dateCsv = recursion.date ?? dateUtc.getDate();
        exp = `0 ${dateUtc.getMinutes()} ${dateUtc.getHours()} ${dateCsv} * *`;
        break;
      case RecursionPeriod.WEEK:
        const dayCsv = recursion.days ? this.toCsvString(recursion.days) : dateUtc.getDay().toString();
        exp = `0 ${dateUtc.getMinutes()} ${dateUtc.getHours()} * * ${dayCsv}`;
        break;
      default:
        throw new Error('Invalid Enum value: RecursionPeriod');
    }
    return exp;
  }
}
