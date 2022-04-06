import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsString, IsDate } from "class-validator";

export class ElderlyCodeDto {
    @ApiProperty()
    @IsString()
    code: string;
}

export class ElderlyProfileDto{
    @ApiProperty()
    @IsNumber()
    uid: number;

    @ApiProperty()
    @IsString()
    imageid: string;

    @ApiProperty()
    @IsString()
    fname: string;

    @ApiProperty()
    @IsString()
    lname: string;

    @ApiProperty()
    @IsString()
    dname: string;
}

export class CaretakerInfoDto{
    @ApiProperty()
    @IsNumber()
    uid: number;

    @ApiProperty()
    @IsString()
    phone: string;

    @ApiProperty()
    @IsString()
    imageid: string;

    @ApiProperty()
    @IsString()
    fname: string;

    @ApiProperty()
    @IsString()
    lname: string;

    @ApiProperty()
    @IsString()
    dname: string;

    @ApiProperty()
    @IsDate()
    bday: Date;

    @ApiProperty()
    @IsString()
    gender: string;
}

