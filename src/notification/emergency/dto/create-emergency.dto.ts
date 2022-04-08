import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';
import { Geolocation } from '../emergency.interface';
export class CreateEmergencyRequest extends Geolocation {}

export class CreateEmergencyResponse {
  @ApiProperty()
  @IsNumber()
  successes: number;
  @ApiProperty()
  @IsNumber()
  fails: number;
}
