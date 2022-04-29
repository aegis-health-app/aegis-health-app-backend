import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Length, Matches } from 'class-validator';
import { PersonalInfo } from '../user.interface';

export class CreateUserDto extends PersonalInfo {
  @ApiProperty()
  @IsString()
  password: string;
  @ApiProperty()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  // @IsPhoneNumber('TH')
  @Expose()
  phone: string;
}
export class UpdateRelationshipDto {
  @ApiProperty()
  @IsNumber()
  eid: number;
  @ApiProperty()
  @IsNumber()
  cid: number;
}
export class UserDto extends PartialType(PersonalInfo) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @IsNumber()
  uid: number;
  @ApiProperty()
  @Expose()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  // @IsPhoneNumber()
  phone: string;
}
export interface IDto<T> {
  new(): T;
}

export class UpdateUserProfileDto extends PartialType(PersonalInfo) { }
export class CreateUserResponse {
  @ApiProperty()
  @IsNumber()
  uid: number;
}

export class LoginDto {
  @ApiProperty()
  @Length(10, 10)
  @Matches(/^0([0-9]{9})$/, { message: 'the phone number is invalid' })
  // @IsPhoneNumber()
  phone: string;

  @ApiProperty()
  @IsString()
  password: string;
}

export class AuthResponse {
  token: string;
}

export class UploadProfileResponse {
  @ApiProperty()
  @IsString()
  url: string;
}
export class UploadProfileRequest {
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

export class ForgotPasswordDto {
  @ApiProperty()
  @IsString()
  phoneNo: string
  @ApiProperty()
  @IsString()
  newPassword: string
}

export class OtpRequestDTO {
  @ApiProperty()
  @IsString()
  status: string;
  @ApiProperty()
  @IsString()
  token: string;
  @ApiProperty()
  @IsString()
  refno: string;
}