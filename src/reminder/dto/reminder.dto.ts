import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsDateString, IsNumber, IsOptional, IsString } from 'class-validator';
import { RecurringInterval, Recursion } from 'src/scheduler/interface/scheduler.interface';
import { ImageDto } from 'src/utils/global.dto';
import { ImportanceLevel } from '../reminder.interface';
import { CreateReminderDto } from './create-reminder.dto';

export class DeleteReminderDto {
  @ApiProperty()
  @IsNumber()
  rid: number;
}

export class GetReminderDto extends DeleteReminderDto {}

export class RecurringDto {
  @ApiProperty()
  @IsNumber()
  recurringDateOfMonth: number;

  @ApiProperty()
  @IsNumber()
  recurringDay: number;
}

export class ReminderDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsDateString()
  startingDateTime: Date;
  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean;
  @ApiProperty()
  @IsString()
  note: string;
  @ApiProperty({ enum: ['Low', 'Medium', 'High'] })
  @IsString()
  importanceLevel: ImportanceLevel;
  @ApiPropertyOptional({ enum: ['EVERY_DAY', 'EVERY_MONTH', 'EVERY_WEEK'] })
  @IsOptional()
  recursion?: RecurringInterval;
  @ApiPropertyOptional()
  @IsOptional()
  customRecursion?: Recursion;
  @ApiProperty()
  @IsNumber()
  uid: number;
  @ApiProperty()
  @IsString()
  imageid: string;
}

export class GetFinishedReminderDto {
  @ApiProperty()
  @IsDate()
  currentDate: Date;
}

export class GetUnFinishedReminderDto extends GetFinishedReminderDto {}

export class ModifiedReminderDto {
  @ApiProperty()
  @IsNumber()
  rid: number;

  @ApiProperty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsString()
  note: string;

  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean;

  @ApiProperty()
  @IsString()
  importanceLevel: string;

  @ApiProperty()
  @IsString()
  imageid: string;

  @ApiProperty()
  @IsNumber()
  hour: number;

  @ApiProperty()
  @IsNumber()
  minute: number;
}

export class ListReminderEachDateDto {
  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({ type: [ModifiedReminderDto] })
  @IsArray()
  reminder: Array<ModifiedReminderDto>;
}

export class ModifiedFutureReminderDto extends ModifiedReminderDto {
  @ApiProperty()
  @IsBoolean()
  isRecurring: boolean;
}

export class ListReminderEachFutureDateDto {
  @ApiProperty()
  @IsDate()
  date: Date;

  @ApiProperty({ type: [ModifiedFutureReminderDto] })
  @IsArray()
  reminder: Array<ModifiedFutureReminderDto>;
}

export class ListUnfinishedReminderDto {
  @ApiProperty({ type: [ListReminderEachDateDto] })
  @IsArray()
  overdue: Array<ListReminderEachDateDto>;

  @ApiProperty({ type: [ListReminderEachFutureDateDto] })
  @IsArray()
  future: Array<ListReminderEachFutureDateDto>;
}

export class MarkAsNotCompleteDto extends DeleteReminderDto {}

export class MarkAsCompleteDto extends DeleteReminderDto {
  @ApiProperty()
  @IsDate()
  currentDate: Date;
}
