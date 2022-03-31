import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsDate, IsObject, IsString } from 'class-validator';

export class HealthDataDto {
  @ApiProperty()
  @IsDate()
  dateTime: Date;

  @ApiProperty()
  @IsArray()
  values: Array<string | number>;
}

export class HealthRecordDto {
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
