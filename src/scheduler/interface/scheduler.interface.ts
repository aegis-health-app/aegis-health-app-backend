import { ApiProperty, PartialType } from '@nestjs/swagger';

//predefined recursion
export enum RecurringInterval {
  EVERY_DAY = 1,
  EVERY_WEEK,
  EVERY_MONTH,
  EVERY_10_MINUTES,
}
//repeat every x week or every x month (for custom recursion)
export enum RecursionPeriod {
  WEEK = 1,
  MONTH,
}

export class Recursion {
  period: RecursionPeriod;
  days?: (0 | 1 | 2 | 3 | 4 | 5 | 6)[];
  dates?: number[];
}

export class Schedule {
  name: string;
  startDate: Date;
  recursion: RecurringInterval;
  customRecursion?: Recursion;
}
