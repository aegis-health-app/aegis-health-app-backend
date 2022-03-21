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
  @Expose()
  imageId: string
  @Expose()
  @IsNotEmpty()
  @IsValidName()
  firstName: string
  @Expose()
  @IsNotEmpty()
  @IsValidName()
  lastName: string
  @Expose()
  @IsNotEmpty()
  displayName: string
  @Expose()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  birthDate: Date
  @Expose()
  @IsNotEmpty()
  @IsEnum(Gender)
  gender: Gender
  @Expose()
  @ToBoolean()
  isElderly: any
  @Expose()
  healthCondition: string
  @Expose()
  @IsOptional()
  @IsEnum(BloodType)
  bloodType: BloodType
  @Expose()
  personalMedication: string
  @Expose()
  allergy: string
  @Expose()
  vaccine: string
}
