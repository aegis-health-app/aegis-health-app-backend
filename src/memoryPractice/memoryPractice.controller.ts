import { Body, Controller, Delete, Get, Post, Put, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotAcceptableResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CaretakerGuard } from 'src/auth/jwt.guard';
import { UserService } from 'src/user/user.service';
import { CreateQuestionDto, DeleteQuestionDto, EditQuestionDto, ElderlyWithCaretakerDto, SelectQuestionDto } from './dto/memoryPractice.dto';
import { AllQuestionsCaretaker, QuestionDetails } from './memoryPractice.interface';
import { MemoryPracticeService } from './memoryPractice.service';

@ApiBearerAuth()
@ApiTags('memory practice')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('memoryPractice')
export class MemoryPracticeController {

  constructor(private readonly memoryPracticeService: MemoryPracticeService, private readonly userService: UserService) { }

  @ApiOperation({ description: "Get all questions for an elderly" })
  @ApiBody({ type: ElderlyWithCaretakerDto })
  @ApiOkResponse({  description: "Get all questions for this elderly successfully" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('/allQuestions')
  async getAllQuestions(@Body() elderlyWithCaretaker: ElderlyWithCaretakerDto, @Req() req): Promise<AllQuestionsCaretaker> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    return await this.memoryPracticeService.getAllQuestions(elderlyWithCaretaker.elderlyuid)
  }

  @ApiOperation({ description: "Get question details for an elderly" })
  @ApiBody({ type: SelectQuestionDto })
  @ApiOkResponse({ description: "Get all questions for this elderly successfully" })
  @ApiBadRequestResponse({ description: "This question cannot be found" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('/selectedQuestion')
  async getSelectedQuestion(@Body() selectQuestionDto: SelectQuestionDto, @Req() req): Promise<QuestionDetails> {
    await this.userService.checkRelationship(selectQuestionDto.elderlyuid, req.user.uid)
    return await this.memoryPracticeService.getSelectedQuestion(selectQuestionDto.elderlyuid, selectQuestionDto.mid)
  }

  @ApiOperation({ description: "Create a question for an elderly" })
  @ApiBody({ type: CreateQuestionDto })
  @ApiOkResponse({ description: "Question created successfully" })
  @ApiNotAcceptableResponse({ description: "Image is too large" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/createQuestion')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(createQuestionDto.elderlyuid, req.user.uid)
    await this.memoryPracticeService.createQuestion(createQuestionDto)
    return res.status(200).json({
      statusCode: 200,
      message: "Question created successfully"
    })
  }

  @ApiOperation({ description: "Edit a question for an elderly" })
  @ApiBody({ type: EditQuestionDto })
  @ApiOkResponse({ description: "Question editted successfully" })
  @ApiBadRequestResponse({ description: "This mid doesn't exist" })
  @ApiNotAcceptableResponse({ description: "Image is too large" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/editQuestion')
  async editQuestion(@Body() editQuestionDto: EditQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(editQuestionDto.elderlyuid, req.user.uid)
    await this.memoryPracticeService.editQuestion(editQuestionDto)
    return res.status(200).json({
      statusCode: 200,
      message: "Question editted succesfully"
    })
  }

  @ApiOperation({ description: "Delete a question for an elderly" })
  @ApiBody({ type: DeleteQuestionDto })
  @ApiOkResponse({ description: "Question deleted successfully" })
  @ApiBadRequestResponse({ description: "This question doesn't exist" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('deleteQuestion')
  async deleteQuestion(@Body() deleteQuestionDto: DeleteQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(deleteQuestionDto.elderlyuid, req.user.uid)
    await this.memoryPracticeService.deleteQuestion(deleteQuestionDto.mid)
    return res.status(200).json({
      statusCode: 200,
      message: "Question deleted successfully"
    })
  }
}
