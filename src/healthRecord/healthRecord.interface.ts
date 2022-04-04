import { ApiProperty } from "@nestjs/swagger"
import { IsObject, IsString } from "class-validator"
import { UploadProfileRequest } from "src/user/dto/user.dto"

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
  @IsObject()
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
  @ApiProperty({ type: [UploadProfileRequest] })
  @IsObject()
  profile: UploadProfileRequest
  @ApiProperty({ type: [HealthDataField] })
  @IsObject()
  listField: HealthDataField[]
}