import { Controller, Get, Post, Req, Param, Query, UseGuards, UsePipes, ValidationPipe, Body } from '@nestjs/common';
import { MemoryPracticeService } from './memory-practice.service';
import { ElderlyGuard, CaretakerGuard } from 'src/auth/jwt.guard';
import { MemoryPracticeQuestionSetDto, createElderlyAnswersDto} from './dto/memory-practice.dto'

@Controller('memory-practice')
export class MemoryPracticeController {
    constructor(private readonly memoryPracticeService: MemoryPracticeService) {}

    @Get('/question-set/')
    @UseGuards(ElderlyGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    async getQuestionSet(@Req() req): Promise<MemoryPracticeQuestionSetDto>{
        const eid = req.user.uid;
        return this.memoryPracticeService.getQuestionSet(eid);
    }

    @Post('/elderly-answers')
    @UseGuards(ElderlyGuard)
    async createElderlyAnswers(@Req() req, @Body() answers: createElderlyAnswersDto){
        const eid = req.user.uid;
        return this.memoryPracticeService.createElderlyAnswers(eid, answers);
    }

    @Get('/history/:eid')
    @UseGuards(CaretakerGuard)
    async getHistory(@Req() req, @Param('eid') eid: number){
        const cid = req.user.uid;
        const limit = req.query.limit;
        const offset = req.query.offset;
        return this.memoryPracticeService.getHistory(eid, cid, limit, offset);
    }

    @Get('/history/timestamp/:eid')
    @UseGuards(CaretakerGuard)
    // getHistoryByTimestamp(eid: number, cid: number, timestamp: string){
    getHistoryByTimestamp(@Req() req, @Param('eid') eid: number, @Query('timestamp') timestamp: string){
        const cid = req.user.uid;
        return this.memoryPracticeService.getHistoryByTimestamp(eid, cid, timestamp);
    }
    
}
