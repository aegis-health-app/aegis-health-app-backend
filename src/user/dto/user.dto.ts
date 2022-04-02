import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';
import { IsNotEmpty, IsNumber, IsPhoneNumber, IsString, Length } from 'class-validator';
import { PersonalInfo } from '../user.interface';

export class CreateUserDto extends PersonalInfo {
  @ApiProperty()
  @IsString()
  password: string;
  @ApiProperty({minLength: 10, maxLength: 10})
  @Expose()
  // @IsPhoneNumber()
  @IsString()
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
  @IsPhoneNumber()
  phone: string;
}
export interface IDto<T> {
  new (): T;
}

export class UpdateUserProfileDto extends PartialType(PersonalInfo) {}
export class CreateUserResponse {
  @ApiProperty()
  @IsNumber()
  uid: number;
}

export class LoginDto {
  @ApiProperty()
  @IsPhoneNumber()
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
