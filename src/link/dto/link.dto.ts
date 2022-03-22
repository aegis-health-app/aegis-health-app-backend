import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty } from "class-validator";


export class ElderlyCodeDto {
    @ApiProperty()
    @IsNotEmpty() 
    code: string;
}

export class UserInfoDto{
    @ApiProperty()
    @IsNotEmpty()
    uid: number;

    @ApiProperty()
    @IsNotEmpty()
    phone: string;

    @ApiProperty()
    imageid: string;

    @ApiProperty()
    @IsNotEmpty()
    fname: string;

    @ApiProperty()
    @IsNotEmpty()
    lname: string;

    @ApiProperty()
    dname: string;

    @ApiProperty()
    @IsNotEmpty()
    bday: Date;

    @ApiProperty()
    @IsNotEmpty()
    gender: string;

    @ApiProperty()
    @IsNotEmpty()
    isElderly: boolean;

    @ApiProperty()
    healthCondition: string;

    @ApiProperty()
    bloodType: string;

    @ApiProperty()
    personalMedication: string;

    @ApiProperty()
    allergy: string;

    @ApiProperty()
    vaccine: string;
}

