import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsDefined, IsNumber } from 'class-validator';
import { Geolocation } from '../emergency.interface';
export class CreateEmergencyRequest extends Geolocation {
  @ApiProperty()
  @IsNumber()
  eid: number;
}

export class CreateEmergencyResponse {
  @ApiProperty()
  @IsNumber()
  successes: number;
  @ApiProperty()
  @IsNumber()
  fails: number;
}
