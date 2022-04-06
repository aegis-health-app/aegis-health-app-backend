import { ApiProperty } from '@nestjs/swagger';
import { IsNumber, IsString } from 'class-validator';

export class Geolocation {
  @ApiProperty()
  @IsNumber()
  latitude: number;
  @ApiProperty()
  @IsNumber()
  longtitude: number;
  @ApiProperty()
  @IsString()
  address: string;
}

export interface EmergencyData {
  elderlyImageId: string;
  elderlyName: string;
  location: Geolocation;
  timestamp: Date;
  elderlyPhone: string;
}
