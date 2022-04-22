import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsDate, IsDateString, IsNotEmpty, IsNotEmptyObject, IsString } from 'class-validator';
import { RecurringInterval, Recursion } from 'src/scheduler/interface/scheduler.interface';
import { ImageDto } from 'src/utils/global.dto';
import { ImportanceLevel } from '../reminder.interface';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsDateString()
  startingDateTime: Date;
  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean;
  @ApiPropertyOptional()
  @IsString()
  note?: string;
  @ApiProperty()
  @IsNotEmptyObject()
  image: ImageDto;
  @ApiProperty({ enum: ['Low', 'Medium', 'High'] })
  @IsString()
  importanceLevel: ImportanceLevel;
  @ApiPropertyOptional({ enum: ['EVERY_DAY', 'EVERY_MONTH', 'EVERY_WEEK'] })
  recursion?: RecurringInterval;
  @ApiPropertyOptional()
  customRecursion?: Recursion;
}
