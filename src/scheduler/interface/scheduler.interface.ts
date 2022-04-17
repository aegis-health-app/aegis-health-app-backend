import { CronExpression } from '@nestjs/schedule';

export enum RecurringInterval {
  EVERY_DAY,
  EVERY_WEEK,
  EVERY_MONTH,
}

export class Schedule {
  name: string;
  startAt: Date;
  recurringOption: RecurringOption;
}

export class RecurringOption {
  recurring: RecurringInterval;
  custom?: string;
}
