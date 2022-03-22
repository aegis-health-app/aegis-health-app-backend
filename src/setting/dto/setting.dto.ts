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
  @ApiProperty(({minLength: 6, maxLength: 6}))
  @IsString()
  enteredPin: string
}