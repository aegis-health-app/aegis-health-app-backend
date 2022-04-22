import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';

//predefined recursion
export enum RecurringInterval {
  EVERY_DAY = 'EVERY_DAY',
  EVERY_WEEK = 'EVERY_WEEK',
  EVERY_MONTH = 'EVERY_MONTH',
  EVERY_10_MINUTES = 'EVERY_10_MINUTES',
}
//repeat every x week or every x month (for custom recursion)
export enum RecursionPeriod {
  WEEK = 'WEEK',
  MONTH = 'MONTH',
}

export class Recursion {
  @ApiProperty({ enum: ['WEEK', 'MONTH'] })
  period: RecursionPeriod;
  @ApiPropertyOptional()
  days?: (1 | 2 | 3 | 4 | 5 | 6 | 7)[];
  @ApiPropertyOptional()
  date?: number;
}

export class Schedule {
  name: string;
  startDate: Date;
  recursion?: RecurringInterval;
  customRecursion?: Recursion;
}
