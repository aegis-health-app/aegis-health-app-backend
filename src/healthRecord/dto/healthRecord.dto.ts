import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsObject, IsString } from 'class-validator';

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
  @IsDate()
  timestamp: Date

  @ApiProperty({ type: [ColumnDataDto] })
  data: Array<ColumnDataDto>
}

export class DeleteHealthDataDto {
  @ApiProperty()
  @IsString()
  hrName: string

  @ApiProperty()
  @IsString()
  columnName: string

  @ApiProperty()
  @IsDate()
  timestamp: Date
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
  image: UploadImageDto
}

