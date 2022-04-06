import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsObject, IsString } from 'class-validator';

export enum Timespan {
  Week = 'week',
  TwoWeeks = '2week',
  Month = 'month',
  ThreeMonths = '3months',
  Year = 'year',
  AllTime = 'allTime',
}

export class HealthAnalyticsDataDto {
  @ApiProperty()
  @IsDate()
  dateTime: Date;

  @ApiProperty()
  @IsNumber()
  value: number;
}
export class HealthTableDataDto {
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

  @ApiProperty({ type: [HealthTableDataDto] })
  @IsObject()
  data: HealthTableDataDto[];
}

export class analyticDataDto {
  @ApiProperty()
  @IsNumber()
  min: number;

  @ApiProperty()
  @IsNumber()
  max: number;

  @ApiProperty()
  @IsNumber()
  mean: number;
}

export class HealthRecordAnalyticsDto {
  @ApiProperty()
  @IsString()
  tableName: string;

  @ApiProperty()
  @IsString()
  columnName: string;

  @ApiProperty()
  @IsString()
  unit: string;

  @ApiProperty({ type: analyticDataDto })
  analyticData: analyticDataDto;

  @ApiProperty({ type: [HealthAnalyticsDataDto] })
  data: HealthAnalyticsDataDto[];
}
