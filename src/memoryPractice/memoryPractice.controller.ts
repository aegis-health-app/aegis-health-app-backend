import { Body, Param, Query, Controller, Delete, Get, Post, Put, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotAcceptableResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiMethodNotAllowedResponse,
} from '@nestjs/swagger';
import { ElderlyGuard, CaretakerGuard } from 'src/auth/jwt.guard';
import { UserService } from 'src/user/user.service';
import {
  AllQuestionsCaretakerDto,
  CreateQuestionDto,
  DeleteQuestionDto,
  EditQuestionDto,
  ElderlyWithCaretakerDto,
  QuestionDetailsDto,
  SelectQuestionDto,
  MemoryPracticeQuestionSetDto,
  CreateElderlyAnswersDto,
  GetHistoryDto,
  GetHistoryByTimestampDto,
} from './dto/memoryPractice.dto';
import { MemoryPracticeService } from './memoryPractice.service';

@ApiBearerAuth()
@ApiTags('memory practice')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('memoryPractice')
export class MemoryPracticeController {
  constructor(private readonly memoryPracticeService: MemoryPracticeService, private readonly userService: UserService) {}

  @ApiOperation({ description: 'Get all questions for an elderly' })
  @ApiBody({ type: ElderlyWithCaretakerDto })
  @ApiOkResponse({ type: AllQuestionsCaretakerDto })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/allQuestions')
  async getAllQuestions(@Body() elderlyWithCaretaker: ElderlyWithCaretakerDto, @Req() req): Promise<AllQuestionsCaretakerDto> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid);
    return await this.memoryPracticeService.getAllQuestions(elderlyWithCaretaker.elderlyuid);
  }

  @ApiOperation({ description: 'Get question details for an elderly' })
  @ApiBody({ type: SelectQuestionDto })
  @ApiOkResponse({ type: QuestionDetailsDto })
  @ApiBadRequestResponse({ description: 'This question cannot be found' })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/selectedQuestion')
  async getSelectedQuestion(@Body() selectQuestionDto: SelectQuestionDto, @Req() req): Promise<QuestionDetailsDto> {
    await this.userService.checkRelationship(selectQuestionDto.elderlyuid, req.user.uid);
    return await this.memoryPracticeService.getSelectedQuestion(selectQuestionDto.elderlyuid, selectQuestionDto.mid);
  }

  @Put('/editSelection')
  async editSelection(@Body() editSelectionDto: EditSelectionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(editSelectionDto.elderlyuid, req.user.uid)
    await this.memoryPracticeService.editSelection(editSelectionDto.elderlyuid, editSelectionDto.mid)
    return res.status(200).json({
      statusCode: 200,
      message: "Question editted succesfully"
    })
  }

  @ApiOperation({ description: "Create a question for an elderly" })
  @ApiBody({ type: CreateQuestionDto })
  @ApiCreatedResponse({ description: 'Question created successfully' })
  @ApiNotAcceptableResponse({ description: 'Image is too large' })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('/createQuestion')
  async createQuestion(@Body() createQuestionDto: CreateQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(createQuestionDto.elderlyuid, req.user.uid);
    await this.memoryPracticeService.createQuestion(createQuestionDto);
    return res.status(201).json({
      statusCode: 201,
      message: 'Question created successfully',
    });
  }

  @ApiOperation({ description: 'Edit a question for an elderly' })
  @ApiBody({ type: EditQuestionDto })
  @ApiOkResponse({ description: 'Question editted successfully' })
  @ApiBadRequestResponse({ description: "This mid doesn't exist" })
  @ApiNotAcceptableResponse({ description: 'Image is too large' })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/editQuestion')
  async editQuestion(@Body() editQuestionDto: EditQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(editQuestionDto.elderlyuid, req.user.uid);
    await this.memoryPracticeService.editQuestion(editQuestionDto);
    return res.status(200).json({
      statusCode: 200,
      message: 'Question editted succesfully',
    });
  }

  @ApiOperation({ description: 'Delete a question for an elderly' })
  @ApiBody({ type: DeleteQuestionDto })
  @ApiOkResponse({ description: 'Question deleted successfully' })
  @ApiBadRequestResponse({ description: "This question doesn't exist" })
  @ApiNotFoundResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('deleteQuestion')
  async deleteQuestion(@Body() deleteQuestionDto: DeleteQuestionDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(deleteQuestionDto.elderlyuid, req.user.uid);
    await this.memoryPracticeService.deleteQuestion(deleteQuestionDto.mid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Question deleted successfully',
    });
  }

  @Get('/questionSet/')
  @ApiOperation({ description: 'Get a list of memory recall questions for an elderly' })
  @ApiBearerAuth()
  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: MemoryPracticeQuestionSetDto })
  @ApiUnauthorizedResponse({ description: 'Login is required' })
  @ApiForbiddenResponse({ description: 'This endpoint is restricted to elderly' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getQuestionSet(@Req() req): Promise<MemoryPracticeQuestionSetDto> {
    const eid = req.user.uid;
    return this.memoryPracticeService.getQuestionSet(eid);
  }

  @Post('/elderlyAnswers')
  @ApiOperation({ description: "Create a record of elderly's answers" })
  @ApiBearerAuth()
  @UseGuards(ElderlyGuard)
  @ApiCreatedResponse({ description: 'Elderly answers are successfully recorded' })
  @ApiUnauthorizedResponse({ description: 'Login is required' })
  @ApiForbiddenResponse({ description: 'This endpoint is restricted to elderly' })
  @ApiBadRequestResponse({ description: 'This question does not exist' })
  @ApiNotAcceptableResponse({ description: 'This question does not belong to this elderly' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async createElderlyAnswers(@Req() req, @Body() answers: CreateElderlyAnswersDto): Promise<{ message: string }> {
    const eid = req.user.uid;
    return this.memoryPracticeService.createElderlyAnswers(eid, answers);
  }

  @Get('/history/:eid')
  @ApiOperation({ description: 'Get a list of timestamps when elderly submitted the answers' })
  @ApiBearerAuth()
  @ApiOkResponse({ type: GetHistoryDto })
  @UseGuards(CaretakerGuard)
  @ApiUnauthorizedResponse({ description: 'Login is required' })
  @ApiForbiddenResponse({ description: 'This endpoint is restricted to caretaker' })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async getHistory(@Req() req, @Param('eid') eid: number): Promise<GetHistoryDto> {
    const cid = req.user.uid;
    const limit = req.query.limit;
    const offset = req.query.offset;
    return this.memoryPracticeService.getHistory(eid, cid, limit, offset);
  }

  @Get('/history/timestamp/:eid')
  @ApiOperation({ description: "Get elderly's answers at the specified timestamp" })
  @ApiBearerAuth()
  @UseGuards(CaretakerGuard)
  @ApiOkResponse({ type: GetHistoryByTimestampDto })
  @ApiUnauthorizedResponse({ description: 'Login is required' })
  @ApiForbiddenResponse({ description: 'This endpoint is restricted to elderly' })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiMethodNotAllowedResponse({ description: 'No record at this timestamp' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  getHistoryByTimestamp(@Req() req, @Param('eid') eid: number, @Query('timestamp') timestamp: string): Promise<GetHistoryByTimestampDto> {
    const cid = req.user.uid;
    return this.memoryPracticeService.getHistoryByTimestamp(eid, cid, timestamp);
  }
}
