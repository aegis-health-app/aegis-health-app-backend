import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator'
import { PersonalInfo } from '../user.interface'
import { Role } from '../../common/roles'

export class CreateUserDto extends PersonalInfo {
  @ApiProperty()
  @IsPhoneNumber()
  phone: string
  @ApiProperty()
  @IsString()
  password: string
}
export class UpdateRelationshipDto {
  @ApiProperty()
  @IsNumber()
  eid: number
  @ApiProperty()
  @IsNumber()
  cid: number
}
export class UserDto extends PartialType(PersonalInfo) {
  @ApiProperty()
  @IsNotEmpty()
  @Expose()
  @IsNumber()
  uid: number
}
export class GetUserRequest {
  @ApiProperty()
  @Expose()
  @IsNumber()
  uid: number
  @ApiProperty()
  imageid: boolean
  @ApiProperty()
  fname: boolean
  @ApiProperty()
  lname: boolean
  @ApiProperty()
  dname: boolean
  @ApiProperty()
  bday: boolean
  @ApiProperty()
  gender: boolean
  @ApiProperty()
  isElderly: boolean
  @ApiProperty()
  healthCondition: boolean
  @ApiProperty()
  bloodType: boolean
  @ApiProperty()
  personalMedication: boolean
  @ApiProperty()
  allergy: boolean
  @ApiProperty()
  vaccine: boolean
}
export interface IDto<T> {
  new (): T
}
export class CreateUserResponse {
  @ApiProperty()
  @IsNumber()
  uid: number
}

export class LoginDto {
  @ApiProperty()
  @IsPhoneNumber()
  phone: string

  @ApiProperty()
  @IsString()
  password: string
}

export class AuthResponse {
  token: string
}

export class UploadProfileResponse {
  @ApiProperty()
  @IsString()
  url: string
}