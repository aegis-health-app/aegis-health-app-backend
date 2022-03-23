import { ApiProperty } from '@nestjs/swagger'
import {IsString} from 'class-validator'

export class OtpDTO {
    @ApiProperty()
    @IsString()
    token: string

    @ApiProperty({minLength: 6, maxLength: 6})
    @IsString()
    pin: string
}