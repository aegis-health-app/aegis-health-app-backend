import { Body, Controller, Delete, Get, Param, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { CaretakerGuard, ElderlyGuard } from 'src/auth/jwt.guard';
import { UserService } from 'src/user/user.service';
import { DeleteReminderDto, GetFinishedReminderDto, GetReminderDto, ListFinishedReminderDto, ReminderDto } from './dto/reminder.dto';
import { ReminderService } from './reminder.service';

@ApiBearerAuth()
@ApiTags("reminder")
@Controller('reminder')
export class ReminderController {
    constructor(private readonly reminderService: ReminderService, private readonly userService: UserService) { }

    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ description: "Deleted reminder from the database succesfully" })
    @ApiBody({ type: DeleteReminderDto })
    @ApiNotFoundResponse({ description: "Reminder not found" })
    @UseGuards(ElderlyGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Delete('delete/elderly')
    async deleteReminderElderly(@Res() res, @Body() body: DeleteReminderDto): Promise<string> {
        await this.reminderService.deleteReminder(body.rid)
        return res.status(200).json({
            statusCode: 200,
            message: "Deleted reminder from the database successfully"
        })
    }


    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be caretaker to use this endpoints" })
    @ApiOkResponse({ description: "Deleted reminder from the database succesfully" })
    @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly"})
    @ApiBody({ type: DeleteReminderDto })
    @ApiNotFoundResponse({ description: "Reminder not found" })
    @UseGuards(CaretakerGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Delete('delete/caretaker/:eid')
    async deleteReminderCaretaker(@Param("eid") eid: number, @Res() res, @Req() req, @Body() body: DeleteReminderDto): Promise<string> {
        await this.userService.checkRelationship(eid, req.user.uid)
        await this.reminderService.deleteReminder(body.rid)
        return res.status(200).json({
            statusCode: 200,
            message: "Deleted reminder from the database successfully"
        })
    }

    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ description: "Get reminder from the database succesfully" })
    @ApiBody({ type: GetReminderDto })
    @ApiNotFoundResponse({ description: "Reminder not found" })
    @UseGuards(ElderlyGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('get/elderly')
    async getReminderElderly(@Body() body: GetReminderDto): Promise<ReminderDto> {
        return await this.reminderService.getReminder(body.rid)
    }


    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be caretaker to use this endpoints" })
    @ApiOkResponse({ description: "Get reminder from the database succesfully" })
    @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly"})
    @ApiBody({ type: GetReminderDto })
    @ApiNotFoundResponse({ description: "Reminder not found" })
    @UseGuards(CaretakerGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('get/caretaker/:eid')
    async getReminderCaretaker(@Param("eid") eid: number, @Req() req, @Body() body: GetReminderDto): Promise<ReminderDto> {
        await this.userService.checkRelationship(eid, req.user.uid)
        return await this.reminderService.getReminder(body.rid)
    }

    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ description: "Get finished reminder from the database succesfully" })
    @ApiBody({ type: GetFinishedReminderDto })
    @UseGuards(ElderlyGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('get/finishedReminder/elderly')
    async getFinishedReminderElderly(@Body() body: GetFinishedReminderDto, @Req() req): Promise<ListFinishedReminderDto[]> {
        return await this.reminderService.getFinishedReminder(body.currentDate, req.user.id)
    }

    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    @ApiForbiddenResponse({ description: "Must be caretaker to use this endpoints" })
    @ApiOkResponse({ description: "Get finished reminder from the database succesfully" })
    @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly"})
    @ApiBody({ type: GetFinishedReminderDto })
    @UseGuards(CaretakerGuard)
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @Get('get/finishedReminder/caretaker/:eid')
    async getFinishedReminderCaretaker(@Param("eid") eid: number, @Req() req, @Body() body: GetFinishedReminderDto): Promise<ListFinishedReminderDto[]> {
        await this.userService.checkRelationship(eid, req.user.uid)
        return await this.reminderService.getFinishedReminder(body.currentDate, req.user.id)
    }
}