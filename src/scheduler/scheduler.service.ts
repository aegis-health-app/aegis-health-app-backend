import { Injectable } from '@nestjs/common';
import { CronExpression, SchedulerRegistry } from '@nestjs/schedule';
import { CronJob } from 'cron';
import moment from 'moment';
import { JobType, RecurringInterval, Recursion, RecursionPeriod, Repetition, Schedule } from './interface/scheduler.interface';

@Injectable()
export class SchedulerService {
  constructor(private schedulerRegistry: SchedulerRegistry) {}
  scheduleRecurringJob(schedule: Schedule, callback: () => void) {
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
    const name = `${jobName}-timeout`;
    const timeDiff = moment(startDate).utcOffset(0).diff(moment(), 'milliseconds');
    this.addTimeout(name, timeDiff, callback);
  }
  scheduleInterval(jobName: string, startDate: Date, repetition: Repetition, callback: () => void) {
    const name = `${jobName}-interval`;
    let iteration = 0;
    const intervalCallback = () => {
      callback();
      iteration++;
      if (repetition.maxIteration && iteration >= repetition.maxIteration) this.deleteJob(jobName, JobType.INTERVAL);
    };
    this.scheduleJob(name, startDate, () => {
      const interval = setInterval(intervalCallback, repetition.interval);
      try {
        this.schedulerRegistry.addInterval(name, interval);
      } catch (e) {
        this.schedulerRegistry.deleteInterval(name);
        this.schedulerRegistry.addInterval(name, interval);
      }
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
  deleteJob(name: string, jobType: JobType, shouldFail?: boolean) {
    const jobName = `${name}-${jobType}`;
    try {
      switch (jobType) {
        case JobType.INTERVAL:
          this.schedulerRegistry.deleteInterval(jobName);
          break;
        case JobType.INTERVAL_TIMEOUT || JobType.TIMEOUT:
          this.schedulerRegistry.deleteTimeout(jobName);
          break;
        case JobType.RECURRING:
          this.schedulerRegistry.deleteCronJob(jobName);
          break;
      }
      return true;
    } catch (e) {
      if (shouldFail) throw new Error('Job not found');
      return false;
    }
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
  private getCustomCronExpression(recursion: Recursion, date: Date): string {
    let exp = '';
    switch (recursion.period) {
      case RecursionPeriod.MONTH:
        const dateCsv = recursion.dates ? this.toCsvString(recursion.dates) : date.getDate();
        exp = `0 ${date.getMinutes()} ${date.getHours()} ${dateCsv} * *`;
        break;
      case RecursionPeriod.WEEK:
        const tempDays = recursion.days?.map((d) => {
          if (d === 7) return 0;
          return d;
        });
        const dayCsv = tempDays ? this.toCsvString(tempDays) : date.getDay().toString();
        exp = `0 ${date.getMinutes()} ${date.getHours()} * * ${dayCsv}`;
        break;
      default:
        throw new Error('Invalid Enum value: RecursionPeriod');
    }
    return exp;
  }
}
