import { IsString, IsNotEmpty } from "class-validator"
import { ApiProperty } from "@nestjs/swagger"

export class ChangePasswordDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  oldPassword: string
  @ApiProperty()
  @IsString() 
  @IsNotEmpty()
  newPassword: string
}
export class ChangePhoneNoDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  newPhone: string
  @ApiProperty(({minLength: 6, maxLength: 6}))
  @IsString()
  @IsNotEmpty()
  enteredPin: string
}
