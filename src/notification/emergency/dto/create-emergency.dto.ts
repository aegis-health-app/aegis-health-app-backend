import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsNumber } from 'class-validator';
import { Geolocation } from '../emergency.interface';
export class CreateEmergencyRequest {
  @ApiProperty()
  @IsNumber()
  eid: number;
  @ApiProperty()
  location: Geolocation;
}

export class CreateEmergencyResponse {
  @ApiProperty()
  @IsNumber()
  successes: number;
  @ApiProperty()
  @IsNumber()
  fails: number;
}
