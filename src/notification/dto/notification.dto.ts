import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class RegisterDeviceDto {
  @ApiProperty()
  @IsString()
  registrationToken: string;
}

export class RegisterDeviceResponse {
  @ApiProperty()
  @IsBoolean()
  success: boolean;
}
