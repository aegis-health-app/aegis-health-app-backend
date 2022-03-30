import { Controller, Get, Post, Delete, Req, Body, Query, Param, UsePipes, ValidationPipe  } from '@nestjs/common';
import { EmotionTrackingService } from './emotion-tracking.service';
import { CreateEmotionRecordDto, EmotionHistoryDto } from './dto/emotion-tracking.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('emotion-tracking')
@Controller('emotion-tracking')
export class EmotionTrackingController {
    constructor(private readonly emotionTrackingService: EmotionTrackingService) {}

    @Post()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    //add elderlyguard
    async createEmotionalRecord(@Req() req, @Query('uid') uid: number, @Body() createEmotionRecordDto: CreateEmotionRecordDto){
        // const uid = req.user.uid;
        const emotionLevel = createEmotionRecordDto.emotionLevel;
        return this.emotionTrackingService.createEmotionalRecord(uid, emotionLevel);
    }

    @Get('/:uid/history')
    @ApiOkResponse({ type: [EmotionHistoryDto] })
    //add caretakerGuard

    async getEmotionalRecord(@Req() req, @Param("uid") uid: number){
        // const caretakerId = req.user.uid;
        const caretakerId = req.query.eid;
        const elderlyId = uid;
        const limit = req.query.limit;
        const offset = req.query.offset;
        return this.emotionTrackingService.getEmotionalRecord(caretakerId, elderlyId, limit, offset);
    }

    @Get('/:uid')
    async checkEmotionTrackingStatus(@Req() req, @Param('uid') uid: number){
        // const caretakerId = req.user.uid;
        const caretakerId = req.query.cid;
        const elderlyId = uid;
        return this.emotionTrackingService.getEmotionTrackingStatus(caretakerId, elderlyId);
    }

    @Post('/:uid')
    async addEmotionTrackingModuleToElderly(@Req() req, @Param("uid") uid: number){
        // const caretakerId = req.user.uid;
        const caretakerId = req.query.cid;
        const elderlyId = uid;
        return this.emotionTrackingService.addEmotionalTrackingModuleToElderly(caretakerId, elderlyId);
    }

    @Delete('/:uid')
    async removeEmotionTrackingModuleFromElderly(@Req() req, @Param("uid") uid: number){
        // const caretakerId = req.user.uid;
        const caretakerId = req.query.cid;
        const elderlyId = uid;
        return this.emotionTrackingService.removeEmotionalTrackingModuleFromElderly(caretakerId, elderlyId);
    }
}

/*
/emotion-tracking
POST -> create emotion rec
                                elderlyGuard

/emotion-tracking/picture
GET get daily greeting picture
                                elderlyGuard
                                implement next week

/emotion-tracking/:uid
GET check if emotion tracking is on. return boolean
                                caretakerGuard

/emotion-tracking/:uid
POST add emotion tracking to elderly's module list
                                caretakerGuard

/emotion-tracking/:uid
DELETE remove emotion tracking from elderly's module list
                                caretakerGuard

/emotion-tracking/:uid/history
GET get elderly emotion record
                                caretakerGuard

/emotion-tracking/:uid/contribution-graph
GET get elderly emotion record data for contribution graph
                                caretakerGuard
                                implement next week





*/

