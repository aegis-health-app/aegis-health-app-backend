import { Body, Controller, Delete, Get, Param, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBadRequestResponse, ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { CaretakerGuard, ElderlyGuard } from 'src/auth/jwt.guard';
import { UserService } from 'src/user/user.service';
import { AddHealthRecordDto, AllHealthRecordDto, ElderlyWithCaretaker } from './healthRecord.dto';
import { HealthRecordService } from './healthRecord.service';

@Controller('healthRecord')
export class HealthRecordController {
  constructor(
    private readonly healthRecordService: HealthRecordService,
    private userService: UserService) { }

  @ApiOperation({ description: "Elderly version: Get all health records" })
  @ApiOkResponse({ description: "Succesful in getting all health records" })
  @ApiBadRequestResponse({ description: "No records found for this elderly" })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('getAll/elderly')
  async getHealthRecordElderly(@Req() req): Promise<AllHealthRecordDto> {
    return await this.healthRecordService.getHealthRecord(req.user.uid)
  }

  @ApiOperation({ description: "Caretaker version: Get all health records" })
  @ApiOkResponse({ description: "Succesful in getting all health records" })
  @ApiBadRequestResponse({ description: "No records found for this elderly" })
  @ApiNotFoundResponse({ description: "Caretaker is not responsible for this elderly" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('getAll/caretaker')
  async getHealthRecordCaretaker(elderlyWithCaretaker: ElderlyWithCaretaker, @Req() req): Promise<AllHealthRecordDto> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    return await this.healthRecordService.getHealthRecord(elderlyWithCaretaker.elderlyuid)
  }

  @ApiOperation({ description: "Elderly version: Add a health record" })
  @ApiBody({ type: AddHealthRecordDto })
  @ApiOkResponse({ description: "Added health record to the database succesfully" })
  @ApiBadRequestResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Health record name is repeated" })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('add/elderly')
  async addHealthRecordElderly(@Body() addRecordInfo: AddHealthRecordDto, @Req() req, @Res() res): Promise<string> {
    await this.healthRecordService.addHealthRecord(req.user.uid, addRecordInfo)
    return res.status(200).json({
      statusCode: 200,
      message: "Added health record to the database successfully"
    })
  }

  @ApiOperation({ description: "Caretaker version: Add a health record" })
  @ApiBody({ type: AddHealthRecordDto })
  @ApiOkResponse({ description: "Added health record to the database succesfully" })
  @ApiBadRequestResponse({ description: "User not found" })
  @ApiNotFoundResponse({ description: "Caretaker is not responsible for this elderly" })
  @ApiConflictResponse({ description: "Health record name is repeated" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('add/caretaker')
  async addHealthRecordCaretaker(@Body() addRecordInfo: AddHealthRecordDto, elderlyWithCaretaker: ElderlyWithCaretaker, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    await this.healthRecordService.addHealthRecord(elderlyWithCaretaker.elderlyuid, addRecordInfo)
    return res.status(200).json({
      statusCode: 200,
      message: "Added health record to the database successfully"
    })
  }

  @ApiOperation({ description: "Elderly version: Delete a health record" })
  @ApiOkResponse({ description: "Deleted health record from the database succesfully" })
  @ApiBadRequestResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "This health record doesn't exist" })
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('delete/elderly/:hrName')
  async deleteHealthRecordElderly(@Param('hrName') hrName: string, @Req() req, @Res() res): Promise<string> {
    await this.healthRecordService.deleteHealthRecord(req.user.uid, hrName)
    return res.status(200).json({
      statusCode: 200,
      message: "Deleted health record from the database successfully"
    })
  }

  @ApiOperation({ description: "Caretaker version: Delete a health record" })
  @ApiOkResponse({ description: "Deleted health record from the database succesfully" })
  @ApiBadRequestResponse({ description: "User not found" })
  @ApiNotFoundResponse({ description: "Caretaker is not responsible for this elderly" })
  @ApiConflictResponse({ description: "This health record doesn't exist" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('delete/caretaker/:hrName')
  async deleteHealthRecordCaretaker(@Param('hrName') hrName: string, elderlyWithCaretaker: ElderlyWithCaretaker, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    await this.healthRecordService.deleteHealthRecord(elderlyWithCaretaker.elderlyuid, hrName)
    return res.status(200).json({
      statusCode: 200,
      message: "Deleted health record from the database successfully"
    })
  }

}