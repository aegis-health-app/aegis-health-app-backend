import { Controller, Get, Post, Req, Param, Query, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { MemoryPracticeService } from './memory-practice.service';
import { ElderlyGuard, CaretakerGuard } from 'src/auth/jwt.guard';
import { MemoryPracticeQuestionSetDto} from './dto/memory-practice.dto'

@Controller('memory-practice')
export class MemoryPracticeController {
    constructor(private readonly memoryPracticeService: MemoryPracticeService) {}

    @Get('/question-set/')
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    async getQuestionSet(@Req() req, @Query('uid') uid:number): Promise<MemoryPracticeQuestionSetDto>{
        // const eid = req.user.uid;
        const eid = uid;
        return this.memoryPracticeService.getQuestionSet(eid);
    }
}
