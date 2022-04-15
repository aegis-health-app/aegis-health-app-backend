import { Body, Controller, Delete, Get, Post, Put, Req, Res, UseGuards } from '@nestjs/common';
import { CaretakerGuard } from 'src/auth/jwt.guard';
import { UserService } from 'src/user/user.service';
import { ElderlyWithCaretakerDto, SelectQuestionDto } from './dto/memoryPractice.dto';
import { AllQuestionsCaretaker, Question, QuestionDetails } from './memoryPractice.interface';
import { MemoryPracticeService } from './memoryPractice.service';

@Controller('memoryPractice')
export class MemoryPracticeController {

  constructor(private readonly memoryPracticeService: MemoryPracticeService,private readonly userService: UserService) {}

  @UseGuards(CaretakerGuard)
  @Get('/allQuestions')
  async getAllQuestions(@Body() elderlyWithCaretaker: ElderlyWithCaretakerDto, @Req() req): Promise<AllQuestionsCaretaker> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    return await this.memoryPracticeService.getAllQuestions(elderlyWithCaretaker.elderlyuid)
  }

  @UseGuards(CaretakerGuard)
  @Get('/selectedQuestion')
  async getSelectedQuestion(@Body() selectQuestionDto: SelectQuestionDto, @Req() req): Promise<QuestionDetails> {
    await this.userService.checkRelationship(selectQuestionDto.elderlyuid, req.user.uid)
    return await this.memoryPracticeService.getSelectedQuestion(selectQuestionDto.elderlyuid, selectQuestionDto.mid)
  }

  // @UseGuards(CaretakerGuard)
  // @Post('/createQuestion')
  // async createQuestion(@Req() req, @Res() res): Promise<string> {
  //   await this.userService.checkRelationship(specificQuestionDto.elderlyuid, req.user.uid)
  //   await this.memoryPracticeService.createQuestion()
  //   return res.status(200).json({
  //     statusCode: 200,
  //     message: "Question created successfully"
  //   })
  // }

  // @UseGuards(CaretakerGuard)
  // @Put('/editQuestion')
  // async editQuestion(@Req() req, @Res() res): Promise<string> {
  //   await this.memoryPracticeService.editQuestion(req.user.uid)
  //   return res.status(200).json({
  //     statusCode: 200,
  //     message: ""
  //   })
  // }

  // @UseGuards(CaretakerGuard)
  // @Delete('deleteQuestion')
  // async deleteQuestion(@Req() req, @Res() res): Promise<string> {
  //   await this.memoryPracticeService.deleteQuestion(req.user.uid)
  //   return res.status(200).json({
  //     statusCode: 200,
  //     message: ""
  //   })
  // }
}
