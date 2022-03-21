import { IsString } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  oldPassword: string
  @ApiProperty()
  @IsString()
  newPassword: string
}
export class ChangePhoneNoDto {
  @ApiProperty()
  @IsString()
  newPhone: string
  @ApiProperty()
  @IsString()
  enteredPin: string
}