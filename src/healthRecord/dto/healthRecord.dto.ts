import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsArray, IsDate, IsNumber, IsObject, IsOptional, IsString } from 'class-validator';

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

export class healthDataRawDto {
  hrName: string
  columnName: string
  unit: string
  value: number;
  timestamp: Date
}

export class ColumnDataDto {
  @ApiProperty()
  @IsString()
  columnName: string

  @ApiProperty()
  @IsNumber()
  value: number
}

export class AddHealthDataDto {
  @ApiProperty()
  @IsString()
  hrName: string

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDate()
  timestamp: Date

  @ApiProperty({ type: [ColumnDataDto] })
  @IsArray()
  data: Array<ColumnDataDto>
}

export class DeleteHealthDataDto {
  @ApiProperty()
  @IsString()
  hrName: string

  @ApiProperty()
  @Expose()
  @Type(() => Date)
  @IsDate()
  timestamp: Date
}

export class HealthRecordDto {
  @ApiProperty()
  @IsString()
  hrName: string
  @ApiProperty()
  @IsString()
  imageid: string
}

export class AllHealthRecordDto {
  @ApiProperty({ type: [HealthRecordDto] })
  @IsArray()
  listHealthRecord: HealthRecordDto[]
}

export class ElderlyWithCaretaker {
  @ApiProperty()
  @IsNumber()
  elderlyuid: number
}

export class UploadImageDto {
  @ApiProperty()
  @IsString()
  base64: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  type: string;
  @ApiProperty()
  @IsNumber()
  size: number;
}

export class EditHealthRecordDto {
  @ApiProperty()
  @IsString()
  hrName: string

  @ApiProperty({ type: UploadImageDto })
  @IsObject()
  image: UploadImageDto
}

export class HealthDataFieldDto {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  unit: string
}

export class AddHealthRecordDto {
  @ApiProperty()
  @IsString()
  hrName: string
  @ApiProperty({ type: UploadImageDto })
  @IsOptional()
  @IsObject()
  picture?: UploadImageDto
  @ApiProperty({ type: [HealthDataFieldDto] })
  @IsArray()
  listField: HealthDataFieldDto[]
}

export class AddHealthRecordCaretakerDto extends AddHealthRecordDto {
  @ApiProperty()
  @IsNumber()
  elderlyuid: number
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
