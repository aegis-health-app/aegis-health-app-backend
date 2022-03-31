import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

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
  listHealthRecord: HealthRecordDto[]
}

export class HealthDataFieldDto {
  @ApiProperty()
  @IsString()
  name: string
  @ApiProperty()
  @IsString()
  unit: string
}

export class AddHealthrecordDto {
  @ApiProperty()
  @IsString()
  hrName: string
  @ApiProperty()
  @IsString()
  imageid: string
  @ApiProperty({ type: [HealthDataFieldDto] })
  listField: HealthDataFieldDto[]
}