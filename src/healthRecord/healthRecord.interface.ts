import { ApiProperty } from "@nestjs/swagger"
import { IsNumber, IsObject, IsString } from "class-validator"
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
  @IsObject()
  picture: UploadImage
  @ApiProperty({ type: [HealthDataField] })
  @IsObject()
  listField: HealthDataField[]
}