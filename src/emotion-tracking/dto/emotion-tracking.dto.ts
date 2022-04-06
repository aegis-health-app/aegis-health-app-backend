import { ApiProperty } from "@nestjs/swagger";
import { IsDate, IsNumber, IsEnum, IsBoolean } from "class-validator";
import { Emotion } from '../emotion-tracking.interface';

export class CreateEmotionRecordDto{
    @ApiProperty({ enum: Emotion})
    @IsEnum(Emotion)
    emotionLevel: string;
}

export class EmotionRecordDto{
    @ApiProperty()
    @IsDate()
    date: Date;

    @ApiProperty({ enum: Emotion})
    @IsEnum(Emotion)
    emotionLevel: Emotion;
}

export class EmotionHistoryDto{
    @ApiProperty()
    @IsNumber()
    count: number;

    @ApiProperty({ type: [EmotionRecordDto]})
    records: Array<EmotionRecordDto>
}

export class EmotionTrackingStatusDto{
    @ApiProperty()
    @IsBoolean()
    isEnabled: boolean;
}
