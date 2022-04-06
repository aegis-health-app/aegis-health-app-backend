import { Controller, Get, Post, Delete, Req, Res, Body, Query, Param, UsePipes, ValidationPipe, UseGuards  } from '@nestjs/common';
import { EmotionTrackingService } from './emotion-tracking.service';
import { CreateEmotionRecordDto, EmotionHistoryDto, EmotionTrackingStatusDto } from './dto/emotion-tracking.dto';
import { ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiConflictResponse, ApiNotFoundResponse, ApiTags } from '@nestjs/swagger';
import { ElderlyGuard, CaretakerGuard } from '../auth/jwt.guard';

@ApiTags('emotion-tracking')
@Controller('emotion-tracking')
export class EmotionTrackingController {
    constructor(private readonly emotionTrackingService: EmotionTrackingService) {}

    @Post()
    @ApiBearerAuth()
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @UseGuards(ElderlyGuard)
    @ApiOperation({description: 'Create a daily emotional record of an elderly'})
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
    @UseGuards(CaretakerGuard)
    @ApiOperation({description: 'Get emotion history of an elderly'})
    @ApiOkResponse({ type: [EmotionHistoryDto] })
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiNotFoundResponse({description: 'Elderly does not exist'})
    async getEmotionalRecord(@Req() req, @Param("uid") uid: number): Promise<EmotionHistoryDto>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        const limit = req.query.limit;
        const offset = req.query.offset;
        return this.emotionTrackingService.getEmotionalRecord(caretakerId, elderlyId, limit, offset);
    }

    @Get('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiOperation({description: 'Get emotion tracking status'})
    @ApiOkResponse({ type: EmotionTrackingStatusDto })
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiNotFoundResponse({description: 'Elderly does not exist'})
    async checkEmotionTrackingStatus(@Req() req, @Param('uid') uid: number): Promise<EmotionTrackingStatusDto>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        return this.emotionTrackingService.getEmotionTrackingStatus(caretakerId, elderlyId);
    }

    @Post('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiOperation({description: 'Enable emotion tracking module'})
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiNotFoundResponse({description: 'Elderly does not exist'})
    @ApiConflictResponse({description: 'Emotion tracking is already enabled'})
    async addEmotionTrackingModuleToElderly(@Req() req, @Param("uid") uid: number): Promise<{message: string}>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        return this.emotionTrackingService.addEmotionalTrackingModuleToElderly(caretakerId, elderlyId);
    }

    @Delete('/:uid')
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiOperation({description: 'Disable emotion tracking module'})
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiNotFoundResponse({description: 'Elderly does not exist'})
    @ApiConflictResponse({description: 'Emotion tracking is already disabled'})
    async removeEmotionTrackingModuleFromElderly(@Req() req,  @Param("uid") uid: number): Promise<{message: string}>{
        const caretakerId = req.user.uid;
        const elderlyId = uid;
        return this.emotionTrackingService.removeEmotionalTrackingModuleFromElderly(caretakerId, elderlyId);
    }
}
