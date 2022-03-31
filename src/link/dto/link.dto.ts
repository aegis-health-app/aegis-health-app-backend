import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString, IsDate } from 'class-validator';

export class ElderlyCodeDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  code: string;
}

export class ElderlyProfileDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uid: number;

  @ApiProperty()
  @IsString()
  imageid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lname: string;

  @ApiProperty()
  @IsString()
  dname: string;
}

export class CaretakerInfoDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uid: number;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty()
  @IsString()
  imageid: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  fname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  lname: string;

  @ApiProperty()
  @IsString()
  dname: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsDate()
  bday: Date;

  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  gender: string;
}
