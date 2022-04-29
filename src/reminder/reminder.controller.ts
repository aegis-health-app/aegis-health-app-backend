import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Put, Res, Query } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto, SimpleStatusResponse, UpdateReminderDto, UploadReminderImageDto } from './dto/create-reminder.dto';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiQuery,
  ApiResponse,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import {
  DeleteReminderDto,
  GetReminderDto,
  ReminderDto,
  GetFinishedReminderDto,
  ListReminderEachDateDto,
  GetUnFinishedReminderDto,
  ListUnfinishedReminderDto,
  MarkAsNotCompleteDto,
  MarkAsCompleteDto,
} from './dto/reminder.dto';
import { UserService } from 'src/user/user.service';
@ApiTags('reminder')
@Controller('reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService, private readonly userService: UserService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid Recurring Interval | Start date cannot be in the past' })
  @ApiMethodNotAllowedResponse({ description: 'You do not have permission to access this elderly' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Image too large | Invalid Image type' })
  @ApiConflictResponse({ description: 'Reminder cannot have both custom and predefined recursion' })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({ type: SimpleStatusResponse })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createReminderDto: CreateReminderDto, @Req() req) {
    return { status: (await this.reminderService.create(createReminderDto, req.user.uid)) ? 'success' : 'fail' };
  }
  @Put()
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid Recurring Interval | Start date cannot be in the past' })
  @ApiMethodNotAllowedResponse({ description: 'You do not have permission to access this elderly' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Image too large | Invalid Image type' })
  @ApiConflictResponse({ description: 'Reminder cannot have both custom and predefined recursion' })
  @ApiNotFoundResponse({ description: 'Reminder does not exist' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({ type: SimpleStatusResponse })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Body() { image, ...rest }: UpdateReminderDto, @Req() req) {
    return { status: (await this.reminderService.update(rest, req.user.uid, image)) ? 'success' : 'fail' };
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Deleted reminder from the database succesfully' })
  @ApiBody({ type: DeleteReminderDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('elderly')
  async deleteReminderElderly(@Res() res, @Body() body: DeleteReminderDto, @Req() req): Promise<string> {
    await this.reminderService.deleteReminder(body.rid, req.user.uid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Deleted reminder from the database successfully',
    });
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Deleted reminder from the database succesfully' })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiBody({ type: DeleteReminderDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('caretaker/:eid')
  async deleteReminderCaretaker(@Param('eid') eid: number, @Res() res, @Req() req, @Body() body: DeleteReminderDto): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    await this.reminderService.deleteReminder(body.rid, eid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Deleted reminder from the database successfully',
    });
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Get reminder from the database succesfully' })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('elderly/:rid')
  async getReminderElderly(@Param() rid: number, @Req() req): Promise<ReminderDto> {
    return await this.reminderService.getReminder(rid, req.user.uid);
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Get reminder from the database succesfully', type: ReminderDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('caretaker/:eid/:rid')
  async getReminderCaretaker(@Param('eid') eid: number, @Param('rid') rid: number, @Req() req): Promise<ReminderDto> {
    await this.userService.checkRelationship(eid, req.user.uid);
    return await this.reminderService.getReminder(rid, eid);
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Get finished reminder from the database succesfully' })
  @ApiQuery({ type: GetFinishedReminderDto })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('finishedReminder/elderly')
  async getFinishedReminderElderly(@Query() query: GetFinishedReminderDto, @Req() req): Promise<ListReminderEachDateDto[]> {
    return await this.reminderService.getFinishedReminder(query.currentDate, req.user.id);
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Get finished reminder from the database succesfully', type: [ListReminderEachDateDto] })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiQuery({ type: GetFinishedReminderDto })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('finishedReminder/caretaker/:eid')
  async getFinishedReminderCaretaker(
    @Param('eid') eid: number,
    @Req() req,
    @Query() query: GetFinishedReminderDto
  ): Promise<ListReminderEachDateDto[]> {
    await this.userService.checkRelationship(eid, req.user.uid);
    return await this.reminderService.getFinishedReminder(query.currentDate, req.user.id);
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Get unfinished reminder from the database succesfully' })
  @ApiQuery({ type: GetUnFinishedReminderDto })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('unfinishedReminder/elderly')
  async getUnfinishedReminderElderly(@Query() query: GetUnFinishedReminderDto, @Req() req): Promise<ListUnfinishedReminderDto> {
    return await this.reminderService.getUnfinishedReminder(query.currentDate, req.user.id);
  }

  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Get unfinished reminder from the database succesfully', type: ListUnfinishedReminderDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiQuery({ type: GetUnFinishedReminderDto })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('unfinishedReminder/caretaker/:eid')
  async getUnfinishedReminderCaretaker(
    @Param('eid') eid: number,
    @Req() req,
    @Query() query: GetUnFinishedReminderDto
  ): Promise<ListUnfinishedReminderDto> {
    await this.userService.checkRelationship(eid, req.user.uid);
    return await this.reminderService.getUnfinishedReminder(query.currentDate, req.user.id);
  }

  @ApiConflictResponse({ description: 'This reminder is not yet completed' })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Mark reminder as not complete from the database succesfully' })
  @ApiBody({ type: MarkAsNotCompleteDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('markAsNotComplete/elderly')
  async markAsNotCompleteElderly(@Res() res, @Body() body: MarkAsNotCompleteDto, @Req() req): Promise<string> {
    await this.reminderService.markAsNotComplete(body.rid, req.user.uid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Mark reminder as not complete from the database successfully',
    });
  }

  @ApiConflictResponse({ description: 'This reminder is not yet completed' })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Mark reminder as not complete from the database succesfully' })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiBody({ type: MarkAsNotCompleteDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('markAsNotComplete/caretaker/:eid')
  async markAsNotCompleteCaretaker(@Param('eid') eid: number, @Res() res, @Req() req, @Body() body: MarkAsNotCompleteDto): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    await this.reminderService.markAsNotComplete(body.rid, eid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Mark reminder as not complete from the database successfully',
    });
  }

  @ApiConflictResponse({
    description:
      'This reminder is already completed or Can not mark reminder in advance over 30 minutes or Can not mark reminder that have recurring',
  })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ description: 'Mark reminder as complete from the database succesfully' })
  @ApiBody({ type: MarkAsCompleteDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('markAsComplete/elderly')
  async markAsCompleteElderly(@Res() res, @Body() body: MarkAsCompleteDto, @Req() req): Promise<string> {
    await this.reminderService.markAsComplete(body.rid, body.currentDate, req.user.uid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Mark reminder as complete from the database successfully',
    });
  }

  @ApiConflictResponse({
    description:
      'This reminder is already completed or Can not mark reminder in advance over 30 minutes or Can not mark reminder that have recurring',
  })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ description: 'Mark reminder as complete from the database succesfully' })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiBody({ type: MarkAsCompleteDto })
  @ApiNotFoundResponse({ description: 'Reminder not found' })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('markAsComplete/caretaker/:eid')
  async markAsCompleteCaretaker(@Param('eid') eid: number, @Res() res, @Req() req, @Body() body: MarkAsCompleteDto): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    await this.reminderService.markAsComplete(body.rid, body.currentDate, eid);
    return res.status(200).json({
      statusCode: 200,
      message: 'Mark reminder as complete from the database successfully',
    });
  }
  //for frontend (FILM) to test notification
  //TODO: remove this before production
  @Get('/test/:rid')
  async testReminderNotification(@Param('rid') rid: number) {
    return await this.reminderService.testNotification(rid);
  }
}
