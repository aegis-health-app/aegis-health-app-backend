import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';



export class DeleteReminderDto {
    @ApiProperty()
    @IsNumber()
    rid: number;
  }

export class GetReminderDto extends DeleteReminderDto {}

export class RecurringDto {
  @ApiProperty()
  @IsNumber()
  recurringDateOfMonth: number

  @ApiProperty()
  @IsNumber()
  recurringDay: number
}

export class ReminderDto {
  @ApiProperty()
  @IsNumber()
  rid: number

  @ApiProperty()
  @IsDate()
  startingDate: Date

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  note: string

  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean

  @ApiProperty()
  @IsString()
  importanceLevel: string

  @ApiProperty()
  @IsString()
  imageid: string

  @ApiProperty()
  @IsBoolean()
  isDone: boolean

  @ApiProperty({ type: [RecurringDto] })
  @IsArray()
  recurrings: Array<RecurringDto>
}

export class GetFinishedReminderDto {
  @ApiProperty()
  @IsDate()
  currentDate: Date
}

export class FinisedReminderDto {
  @ApiProperty()
  @IsNumber()
  rid: number

  @ApiProperty()
  @IsString()
  title: string

  @ApiProperty()
  @IsString()
  note: string

  @ApiProperty()
  @IsBoolean()
  isRemindCaretaker: boolean

  @ApiProperty()
  @IsString()
  importanceLevel: string

  @ApiProperty()
  @IsString()
  imageid: string

  @ApiProperty()
  @IsNumber()
  hour: number

  @ApiProperty()
  @IsNumber()
  minute: number
}

export class ListFinishedReminderDto {
  @ApiProperty()
  @IsDate()
  date: Date

  @ApiProperty({ type: [FinisedReminderDto] })
  @IsArray()
  reminder: Array<FinisedReminderDto>
}