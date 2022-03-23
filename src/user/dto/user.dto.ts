import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber, IsString } from 'class-validator'
import { PersonalInfo } from '../user.interface'
import { Role } from '../../common/roles'

export class CreateUserDto extends PersonalInfo {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber()
  phone: string
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string
}
export class UpdateRelationshipDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  eid: number
  @ApiProperty()
  @IsNotEmpty()
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
  @IsNotEmpty()
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
export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uid: number
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
  @IsNotEmpty()
  phone: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  role: Role
}

export class AuthResponse {
  token: string
}