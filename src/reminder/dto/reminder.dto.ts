import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsBoolean, IsDate, IsNumber, IsString } from 'class-validator';



export class DeleteReminderDto {
    @ApiProperty()
    @IsNumber()
    rid: number;
  }

export class GetReminderDto extends DeleteReminderDto {}


export class RecurringDto {
  recurringDateOfMonth: number
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
