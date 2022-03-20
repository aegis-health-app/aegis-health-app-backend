import { ApiProperty } from '@nestjs/swagger'
import {IsString} from 'class-validator'
// import { Type } from 'class-transformer'

export class OtpDTO {
    @ApiProperty()
    @IsString()
    token: String

    @ApiProperty({minLength: 4, maxLength: 4})
    @IsString()
    pin: String
}