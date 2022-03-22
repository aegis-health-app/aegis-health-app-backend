import { ApiProperty } from '@nestjs/swagger'
import { Expose, Type } from 'class-transformer'
import { IsNotEmpty, IsDate, IsEnum, IsOptional } from 'class-validator'
import { ToBoolean } from 'src/utils/transformer'
import { IsValidName } from './user.validator'
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}
export enum BloodType {
  A = 'A',
  B = 'B',
  O = 'O',
  AB = 'AB',
}
@Expose()
export class PersonalInfo {
  @ApiProperty()
  @Expose()
  imageid: string
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsValidName()
  fname: string
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsValidName()
  lname: string
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  dname: string
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  bday: Date
  @ApiProperty({ enum: ['F', 'M'] })
  @Expose()
  @IsNotEmpty()
  gender: string
  @ApiProperty()
  @Expose()
  @ToBoolean()
  isElderly: boolean
  @ApiProperty()
  @Expose()
  healthCondition: string
  @ApiProperty({ enum: ['A', 'B', 'O', 'AB'] })
  @Expose()
  @IsOptional()
  bloodType: string
  @ApiProperty()
  @Expose()
  personalMedication: string
  @ApiProperty()
  @Expose()
  allergy: string
  @ApiProperty()
  @Expose()
  vaccine: string
}
