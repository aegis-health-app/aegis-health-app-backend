import { Controller, Get, Post, Delete, Req, Body, Query, Param, UsePipes, ValidationPipe, UseGuards  } from '@nestjs/common';
import { EmotionTrackingService } from './emotion-tracking.service';
import { CreateEmotionRecordDto, EmotionHistoryDto } from './dto/emotion-tracking.dto';
import { ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiConflictResponse, ApiTags } from '@nestjs/swagger';
import { ElderlyGuard, CaretakerGuard } from '../auth/jwt.guard';

@ApiTags('emotion-tracking')
@Controller('emotion-tracking')
export class EmotionTrackingController {
    constructor(private readonly emotionTrackingService: EmotionTrackingService) {}

    @Post()
    @ApiBearerAuth()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @UseGuards(ElderlyGuard)
    @ApiCreatedResponse({description: 'Emotion record successfully created'})
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to elderly'})
    @ApiBadRequestResponse({description: 'Emotion record of this elderly has already been made today'})
    async createEmotionalRecord(@Req() req, @Body() createEmotionRecordDto: CreateEmotionRecordDto): Promise<{message: string}>{
        const uid = req.user.uid;
        const emotionLevel = createEmotionRecordDto.emotionLevel;
        return this.emotionTrackingService.createEmotionalRecord(uid, emotionLevel);
    }

    @Get('/:uid/history')
    @ApiBearerAuth()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @ApiOkResponse({ type: [EmotionHistoryDto] })
    @UseGuards(CaretakerGuard)
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    async getEmotionalRecord(@Req() req, @Param("uid") uid: number){
    // async getEmotionalRecord(@Req() req, @Param("uid") uid: number): Promise<EmotionHistoryDto>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        const limit = req.query.limit;
        const offset = req.query.offset;
        return this.emotionTrackingService.getEmotionalRecord(caretakerId, elderlyId, limit, offset);
    }

    @Get('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    async checkEmotionTrackingStatus(@Req() req, @Param('uid') uid: number): Promise<boolean>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        return this.emotionTrackingService.getEmotionTrackingStatus(caretakerId, elderlyId);
    }

    @Post('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiConflictResponse({description: 'Emotion tracking is already enabled'})
    async addEmotionTrackingModuleToElderly(@Req() req, @Param("uid") uid: number): Promise<{message: string}>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        return this.emotionTrackingService.addEmotionalTrackingModuleToElderly(caretakerId, elderlyId);
    }

    @Delete('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiConflictResponse({description: 'Emotion tracking is already disabled'})
    async removeEmotionTrackingModuleFromElderly(@Req() req, @Param("uid") uid: number): Promise<{message: string}>{
        const caretakerId = req.user.uid;
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

