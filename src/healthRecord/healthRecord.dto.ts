import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsObject, IsString } from "class-validator"

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
  @ApiProperty()
  @IsString()
  imageid: string
  @ApiProperty({ type: [HealthDataFieldDto] })
  @IsObject()
  listField: HealthDataFieldDto[]
}
