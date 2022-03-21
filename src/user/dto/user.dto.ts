import { PartialType } from '@nestjs/mapped-types'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsNumberString, IsOptional, IsPhoneNumber } from 'class-validator'
import { PersonalInfo } from '../user.interface'

export class CreateUserDto extends PersonalInfo {
  @IsNotEmpty()
  @IsPhoneNumber('TH')
  phone: string
  @IsNotEmpty()
  password: string
}
export class UpdateRelationshipDto {
  @IsNotEmpty()
  @IsNumber()
  eid: number
  @IsNotEmpty()
  @IsNumber()
  cid: number
}

export class UpdatePersonalInfoDto extends PartialType(PersonalInfo) {
  @Expose()
  @IsNotEmpty()
  @IsNumberString()
  uid: number
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @IsNotEmpty()
  @IsNumberString()
  uid: number
}
