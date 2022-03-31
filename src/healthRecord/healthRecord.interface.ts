import { ApiProperty } from "@nestjs/swagger"
import { IsString } from "class-validator"

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
  listHealthRecord: HealthRecord[]
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
  @ApiProperty()
  @IsString()
  imageid: string
  @ApiProperty({ type: [HealthDataField] })
  listField: HealthDataField[]
}