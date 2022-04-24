import { ApiProperty } from '@nestjs/swagger';
import { Expose, Type } from 'class-transformer';
import { IsNotEmpty, IsDate, IsEnum, IsOptional, IsString, IsPhoneNumber, IsBoolean } from 'class-validator';
import { IsValidName } from './user.validator';
export enum Gender {
  MALE = 'M',
  FEMALE = 'F',
}
export enum BloodType {
  A = 'A',
  B = 'B',
  O = 'O',
  AB = 'AB',
  NA = 'N/A',
}
@Expose()
export class PersonalInfo {
  @ApiProperty()
  @Expose()
  imageid: string;
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsValidName()
  fname: string;
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @IsString()
  @IsValidName()
  lname: string;
  @ApiProperty()
  @Expose()
  @IsString()
  @IsNotEmpty()
  dname: string;
  @ApiProperty()
  @Expose()
  @IsNotEmpty()
  @Type(() => Date)
  @IsDate()
  bday: Date;
  @ApiProperty({ enum: ['F', 'M'] })
  @Expose()
  @IsNotEmpty()
  gender: string;
  @ApiProperty()
  @Expose()
  @IsBoolean()
  isElderly: boolean;
  @ApiProperty()
  @Expose()
  @IsOptional()
  healthCondition: string;
  @ApiProperty({ enum: ['A', 'B', 'O', 'AB', 'N/A'] })
  @Expose()
  @IsOptional()
  bloodType: string;
  @ApiProperty()
  @Expose()
  @IsOptional()
  personalMedication: string;
  @ApiProperty()
  @Expose()
  @IsOptional()
  allergy: string;
  @ApiProperty()
  @Expose()
  @IsOptional()
  vaccine: string;
}
