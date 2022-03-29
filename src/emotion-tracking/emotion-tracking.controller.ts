import { Controller, Get, Post, Req, Res, Body, Query, UsePipes, ValidationPipe  } from '@nestjs/common';
import { EmotionTrackingService } from './emotion-tracking.service';
import { CreateEmotionRecordDto } from './dto/emotion-tracking.dto';


@Controller('emotion-tracking')
export class EmotionTrackingController {
    constructor(private readonly emotionTrackingService: EmotionTrackingService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    async createEmotionRecord(@Req() req, @Query('uid') uid: number, @Body() createEmotionRecordDto: CreateEmotionRecordDto){
        // const uid = req.user.uid;
        const emotionLevel = createEmotionRecordDto.emotionLevel;
        return this.emotionTrackingService.createEmotionalRecord(uid, emotionLevel);
    }
}
