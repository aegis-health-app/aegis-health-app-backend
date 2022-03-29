import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsIn } from "class-validator";

export class CreateEmotionRecordDto{
    @ApiProperty()
    @IsString()
    @IsIn(['1', '2', '3', '4'])
    emotionLevel: string;
}
