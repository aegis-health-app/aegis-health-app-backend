import { ApiProperty } from "@nestjs/swagger";
import { IsString, IsDate, IsIn } from "class-validator";

export class CreateEmotionRecordDto{
    @ApiProperty()
    @IsString()
    @IsIn(['1', '2', '3', '4'])
    emotionLevel: string;
}

export class EmotionHistoryDto{
    @ApiProperty()
    @IsDate()
    date: Date;

    @ApiProperty()
    @IsString()
    @IsIn(['1', '2', '3', '4'])
    emotionLevel: string;
}
