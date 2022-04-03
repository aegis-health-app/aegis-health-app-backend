import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsObject, IsString } from 'class-validator';

export enum Timespan {
  Week = 'week',
  TwoWeeks = '2week',
  Month = 'month',
  ThreeMonths = '3months',
  Year = 'year',
  AllTime = 'allTime',
}
export class HealthDataDto {
  @ApiProperty()
  @IsDate()
  dateTime: Date;

  @ApiProperty()
  @IsArray()
  values: Array<string>;
}

export class HealthRecordTableDto {
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
