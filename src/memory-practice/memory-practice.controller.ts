import { Controller, Get, Post, Req, Param, Query, UseGuards, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { MemoryPracticeService } from './memory-practice.service';
import { ElderlyGuard, CaretakerGuard } from 'src/auth/jwt.guard';
import { MemoryPracticeQuestionSetDto, CreateElderlyAnswersDto, GetHistoryDto, GetHistoryByTimestampDto} from './dto/memory-practice.dto';
import { ApiOperation, ApiOkResponse, ApiCreatedResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiMethodNotAllowedResponse, ApiNotAcceptableResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('memory-practice')
@Controller('memory-practice')
export class MemoryPracticeController {
    constructor(private readonly memoryPracticeService: MemoryPracticeService) {}

    @Get('/question-set/')
    @ApiOperation({description: 'Get a list of memory recall questions for an elderly'})
    @ApiBearerAuth()
    @UseGuards(ElderlyGuard)
    @ApiOkResponse({ type: MemoryPracticeQuestionSetDto })
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to elderly'})
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    async getQuestionSet(@Req() req): Promise<MemoryPracticeQuestionSetDto>{
        const eid = req.user.uid;
        return this.memoryPracticeService.getQuestionSet(eid);
    }

    @Post('/elderly-answers')
    @ApiOperation({description: "Create a record of elderly's answers"})
    @ApiBearerAuth()
    @UseGuards(ElderlyGuard)
    @ApiCreatedResponse({description: 'Elderly answers are successfully recorded'})
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to elderly'})
    @ApiBadRequestResponse({description: 'This question does not exist'})
    @ApiNotAcceptableResponse({description: 'This question does not belong to this elderly'})
    // @UsePipes(new ValidationPipe({ whitelist: true }))
    async createElderlyAnswers(@Req() req, @Body() answers: CreateElderlyAnswersDto): Promise<{message: string}>{
        const eid = req.user.uid;
        return this.memoryPracticeService.createElderlyAnswers(eid, answers);
    }

    @Get('/history/:eid')
    @ApiOperation({description: "Get a list of timestamps when elderly submitted the answers"})
    @ApiBearerAuth()
    @ApiOkResponse({ type: GetHistoryDto })
    @UseGuards(CaretakerGuard)
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to caretaker'})
    @ApiBadRequestResponse({description: "Caretaker doesn't have access to this elderly"})
    @UsePipes(new ValidationPipe({ whitelist: true })) 
    async getHistory(@Req() req, @Param('eid') eid: number): Promise<GetHistoryDto>{
        const cid = req.user.uid;
        const limit = req.query.limit;
        const offset = req.query.offset;
        return this.memoryPracticeService.getHistory(eid, cid, limit, offset);
    }

    @Get('/history/timestamp/:eid')
    @ApiOperation({description: "Get elderly's answers at the specified timestamp"})
    @ApiBearerAuth()
    @UseGuards(CaretakerGuard)
    @ApiOkResponse({ type: GetHistoryByTimestampDto })
    @ApiUnauthorizedResponse({description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted to elderly'})
    @ApiBadRequestResponse({description: "Caretaker doesn't have access to this elderly"})
    @ApiMethodNotAllowedResponse({description: 'No record at this timestamp'})
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    getHistoryByTimestamp(@Req() req, @Param('eid') eid: number, @Query('timestamp') timestamp: string): Promise<GetHistoryByTimestampDto>{
        const cid = req.user.uid;
        return this.memoryPracticeService.getHistoryByTimestamp(eid, cid, timestamp);
    }
    
}
