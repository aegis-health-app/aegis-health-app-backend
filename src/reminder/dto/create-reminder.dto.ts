import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsBoolean, IsDate, IsDateString, IsDefined, IsNotEmpty, IsNotEmptyObject, IsNumber, IsOptional, IsString } from 'class-validator';
import { RecurringInterval, Recursion } from 'src/scheduler/interface/scheduler.interface';
import { ImageDto } from 'src/utils/global.dto';
import { ImportanceLevel } from '../reminder.interface';

export class CreateReminderDto {
  @ApiProperty()
  @IsString()
  title: string;
  @ApiProperty()
  @IsDateString()
  startingDateTime: string;
  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean;
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  note?: string;
  @ApiProperty({ enum: ['Low', 'Medium', 'High'] })
  @IsOptional()
  @IsString()
  importanceLevel: ImportanceLevel;
  @ApiPropertyOptional({ enum: ['EVERY_DAY', 'EVERY_MONTH', 'EVERY_WEEK'] })
  @IsOptional()
  recursion?: RecurringInterval;
  @ApiPropertyOptional()
  @IsOptional()
  customRecursion?: Recursion;
  @ApiPropertyOptional()
  @IsOptional()
  @IsNumber()
  eid?: number;
  @ApiProperty()
  @IsOptional()
  @IsDefined()
  image?: ImageDto;
}

export class UpdateReminderDto extends PartialType(CreateReminderDto) {
  @ApiProperty()
  @IsNumber()
  rid: number;
}

export class SimpleStatusResponse {
  @ApiProperty({ enum: ['success', 'fail'] })
  @IsString()
  status: string;
}

export class UploadReminderImageDto extends ImageDto {
  @ApiProperty()
  @IsNumber()
  rid: number;
}
