import { ApiProperty } from '@nestjs/swagger'
import { IsDate, IsNumber, IsString } from 'class-validator'

export class ElderlyHomeDTO {
    @ApiProperty()
    @IsString()
    dname: string

    @ApiProperty()
    @IsString()
    imageid: string

    @IsNumber({},{each: true})
    listModuleid: number[]
}

export class ElderlyDTO {
    @ApiProperty()
    @IsNumber()
    uid: number

    @ApiProperty()
    @IsString()
    dname: string

    @ApiProperty()
    @IsString()
    imageid: string
}

export class CaretakerHomeDTO {
    @ApiProperty()
    @IsString()

    dname: string

    @ApiProperty()
    @IsString()
    imageid: string

    @ApiProperty({ type: [ElderlyDTO] })
    listElderly: Array<ElderlyDTO>
}

export class ElderlyInfoDTO {
    @ApiProperty()
    @IsString()
    imageid: string

    @ApiProperty()
    @IsString()
    fname: string

    @ApiProperty()
    @IsString()
    lname: string

    @ApiProperty()
    @IsString()
    dname: string

    @ApiProperty()
    @IsString()
    gender: string

    @ApiProperty()
    @IsDate()
    bday: Date

    @ApiProperty()
    @IsString()
    healthCondition: string

    @ApiProperty()
    @IsString()
    bloodType: string

    @ApiProperty()
    @IsString()
    personalMedication: string

    @ApiProperty()
    @IsString()
    allergy: string

    @ApiProperty()
    @IsString()
    vaccine: string

    @ApiProperty()
    @IsString()
    phone: string

    @ApiProperty()
    @IsNumber({},{each: true})
    listModuleid: number[]
}

export class DeleteModuleDTO {
    @ApiProperty()
    @IsNumber()
    moduleid: number
}

export class AddModuleDTO {
    @ApiProperty()
    @IsNumber()
    moduleid: number
}