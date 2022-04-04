import { ApiProperty } from '@nestjs/swagger';
import { IsNumber } from 'class-validator';

export class Geolocation {
  @ApiProperty()
  @IsNumber()
  latitude: number;
  @ApiProperty()
  @IsNumber()
  longtitude: number;
}

export interface EmergencyData {
  elderlyImageId: string;
  elderlyName: string;
  location: Geolocation;
  timestamp: Date;
  elderlyPhone: string;
}
