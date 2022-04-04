import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsNumber, IsObject, IsString } from 'class-validator';
import { UploadProfileRequest } from 'src/user/dto/user.dto';

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
  @IsObject()
  listHealthRecord: HealthRecordDto[]
}

export class ElderlyWithCaretaker {
  @ApiProperty()
  @IsNumber()
  elderlyuid: number
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
  @ApiProperty({ type: [UploadProfileRequest] })
  @IsObject()
  profile: UploadProfileRequest
  @ApiProperty({ type: [HealthDataFieldDto] })
  @IsObject()
  listField: HealthDataFieldDto[]
}
