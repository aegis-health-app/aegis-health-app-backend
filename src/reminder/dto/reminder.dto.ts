import { ApiProperty } from '@nestjs/swagger';
import { IsString } from 'class-validator';



export class DeleteReminderDto {
    @ApiProperty()
    @IsString()
    rid: string;
  }