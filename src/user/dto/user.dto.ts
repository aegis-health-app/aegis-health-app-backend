import { ApiProperty, PartialType } from '@nestjs/swagger'
import { Exclude, Expose, Type } from 'class-transformer'
import { IsDate, IsEnum, IsNotEmpty, IsNumber, IsOptional, IsPhoneNumber } from 'class-validator'
import { PersonalInfo } from '../user.interface'

export class CreateUserDto extends PersonalInfo {
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('TH')
  phone: string
  @ApiProperty()
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
export class GetUserDto extends PersonalInfo {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uid: number
  @ApiProperty()
  @IsNotEmpty()
  @IsPhoneNumber('TH')
  phone: string
}

export class UpdatePersonalInfoDto extends PartialType(PersonalInfo) {
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsNumber()
  uid: number
}

export class UpdateUserDto extends PartialType(CreateUserDto) {
  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  uid: number
}

export class CreateUserResponse {
  @ApiProperty()
  uid: number
}
