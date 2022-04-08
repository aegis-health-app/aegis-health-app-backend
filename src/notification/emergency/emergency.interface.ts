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

export interface EmergencyData extends Geolocation {
  elderlyImageId: string;
  elderlyName: string;
  address: string;
  timestamp: string;
  elderlyPhone: string;
}
