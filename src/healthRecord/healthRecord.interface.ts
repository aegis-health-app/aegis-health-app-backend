import { ApiProperty } from "@nestjs/swagger"
import { IsArray, IsNumber, IsObject, IsOptional, IsString } from "class-validator"

export class HealthRecord {
  @ApiProperty()
  @IsString()
  hrName: string
  @ApiProperty()
  @IsString()
  imageid: string
}

export class AllHealthRecord {
  @ApiProperty({ type: [HealthRecord] })
  @IsArray()
  listHealthRecord: HealthRecord[]
}

export class UploadImage {
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

export class HealthDataField {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  unit: string
}

export class AddHealthrecord {
  @ApiProperty()
  @IsString()
  hrName: string
  @ApiProperty({ type: UploadImage })
  @IsOptional()
  @IsObject()
  picture?: UploadImage
  @ApiProperty({ type: [HealthDataField] })
  @IsArray()
  listField: HealthDataField[]
}
// Raw data queried from MySql
export interface healthTableDataRawInterface extends HealthDataRawInterface {
  imageId: string;
}
export interface HealthAnalyticsDataRawInterface extends HealthDataRawInterface {}

export interface HealthDataRawInterface {
  hrName: string;
  columnName: string;
  unit: string;
  value: number;
  timestamp: Date;
}

export interface HealthColumnInterface {
  columnNames: string[],
  units: string[]
}
export interface HealthColumnRawInterface {
  hrName: string,
  columnName: string,
  unit: string
}
