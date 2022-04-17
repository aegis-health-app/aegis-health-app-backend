import { CronExpression } from '@nestjs/schedule';
import { ApiProperty } from '@nestjs/swagger';

export enum RecurringInterval {
  EVERY_DAY,
  EVERY_WEEK,
  EVERY_MONTH,
}

export class RecurringOption {
  @ApiProperty()
  recursion: RecurringInterval;
  @ApiProperty()
  customRecursion?: string;
}

export class Schedule extends RecurringOption {
  @ApiProperty()
  name: string;
  @ApiProperty()
  startAt: Date;
}
