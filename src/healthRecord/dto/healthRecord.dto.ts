import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsObject, IsString } from 'class-validator';

export class HealthDataDto {
  @ApiProperty()
  @IsDate()
  dateTime: Date;

  @ApiProperty()
  @IsArray()
  values: Array<string>;
}

export class HealthRecordDto {
 @ApiProperty()
  @IsString()
  imageId: string;
  
  @ApiProperty()
  @IsString()
  tableName: string;

  @ApiProperty()
  @IsArray()
  columnNames: string[];

  @ApiProperty()
  @IsArray()
  units: string[];

  @ApiProperty({ type: [HealthDataDto] })
  @IsObject()
  data: HealthDataDto[];
}

export class healthDataRawDto {
    hrName: string
    columnName: string
    unit: string
    value: number;
    timestamp: Date
}