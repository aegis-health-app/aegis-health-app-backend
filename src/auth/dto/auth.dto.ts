import { ApiProperty } from '@nestjs/swagger'
import {IsString} from 'class-validator'
// import { Type } from 'class-transformer'

export class OtpDTO {
    @ApiProperty()
    @IsString()
    token: String

    @ApiProperty({minLength: 6, maxLength: 6})
    @IsString()
    pin: String
}