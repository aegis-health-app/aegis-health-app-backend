import { Controller, UseGuards, Get, Param, UsePipes, ValidationPipe, Post, Body, Res, Delete, Put, Request, Req } from "@nestjs/common";
import { ApiBearerAuth, ApiTags, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiOkResponse, ApiNotFoundResponse, ApiParam, ApiBadRequestResponse, ApiConflictResponse, ApiBody, ApiNotAcceptableResponse, ApiOperation } from "@nestjs/swagger";
import { ElderlyGuard, CaretakerGuard } from "src/auth/jwt.guard";
import { UserService } from "src/user/user.service";
import { HealthRecordTableDto, HealthRecordAnalyticsDto, Timespan, AddHealthDataDto, DeleteHealthDataDto, EditHealthRecordDto, AddHealthRecordCaretakerDto, AddHealthRecordDto, AllHealthRecordDto, ElderlyWithCaretaker } from "./dto/healthRecord.dto";
import { HealthRecordService } from "./healthRecord.service";


@ApiBearerAuth()
@ApiTags('health record')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService, private readonly userService: UserService) { }

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
  async getHealthRecordCaretaker(@Body() elderlyWithCaretaker: ElderlyWithCaretaker, @Req() req): Promise<AllHealthRecordDto> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    return await this.healthRecordService.getHealthRecord(elderlyWithCaretaker.elderlyuid)
  }

  @ApiOperation({ description: "Elderly version: Add a health record" })
  @ApiBody({ type: AddHealthRecordDto })
  @ApiOkResponse({ description: "Added health record to the database succesfully" })
  @ApiBadRequestResponse({ description: "User not found" })
  @ApiNotAcceptableResponse({ description: "Image is too large" })
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
  @ApiNotAcceptableResponse({ description: "Image is too large" })
  @ApiConflictResponse({ description: "Health record name is repeated" })
  @UseGuards(CaretakerGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('add/caretaker')
  async addHealthRecordCaretaker(@Body() addRecordInfo: AddHealthRecordCaretakerDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(addRecordInfo.elderlyuid, req.user.uid)
    await this.healthRecordService.addHealthRecord(addRecordInfo.elderlyuid, addRecordInfo)
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
  async deleteHealthRecordCaretaker(@Param('hrName') hrName: string, @Body() elderlyWithCaretaker: ElderlyWithCaretaker, @Req() req, @Res() res): Promise<string> {
    await this.userService.checkRelationship(elderlyWithCaretaker.elderlyuid, req.user.uid)
    await this.healthRecordService.deleteHealthRecord(elderlyWithCaretaker.elderlyuid, hrName)
    return res.status(200).json({
      statusCode: 200,
      message: "Deleted health record from the database successfully"
    })
  }

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiNotFoundResponse({ description: 'Health Record Name Not Found' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @Get('/table/:healthRecordName')
  async getHealthDataByElderly(@Param('healthRecordName') healthRecordName: string, @Request() req): Promise<HealthRecordTableDto> {
    const elderlyId = req.user.uid;
    await this.healthRecordService.checkHealthRecordExist(Number(elderlyId), healthRecordName);
    return await this.healthRecordService.getHealthTable(Number(elderlyId), healthRecordName);
  }

  @UseGuards(CaretakerGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiNotFoundResponse({ description: 'Elderly Does Not Exist' })
  @ApiNotFoundResponse({ description: 'Health Record Name Not Found' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'elderlyId', type: String, description: 'id of elderly interested' })
  @Get('/table/:elderlyId/:healthRecordName')
  async getHealthDataByCaretaker(
    @Param('elderlyId') elderlyId: string,
    @Param('healthRecordName') healthRecordName: string,
    @Request() req
  ): Promise<HealthRecordTableDto> {
    const caretakerId = req.user.uid;
    await this.userService.checkRelationship(Number(elderlyId), Number(caretakerId));
    await this.healthRecordService.checkHealthRecordExist(Number(elderlyId), healthRecordName);
    return await this.healthRecordService.getHealthTable(Number(elderlyId), healthRecordName);
  }

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordAnalyticsDto })
  @ApiNotFoundResponse({ description: 'Health Column Name Not Found' })
  @ApiNotFoundResponse({ description: 'Health Record Name Not Found' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'columnName', description: 'column name in health record user wants to query' })
  @ApiParam({ name: 'timespan', type: String, enum: Timespan, description: 'timespan of data user wants to query' })
  @Get('analytics/:healthRecordName/:columnName/:timespan')
  async getHealthAnalyticsByElderly(
    @Param('healthRecordName') healthRecordName: string,
    @Param('columnName') columnName: string,
    @Param('timespan') timespan: Timespan = Timespan.Year,
    @Request() req
  ): Promise<HealthRecordAnalyticsDto> {
    const elderlyId = req.user.uid;
    await this.healthRecordService.checkHealthRecordExist(Number(elderlyId), healthRecordName);
    await this.healthRecordService.checkHealthColumnExist(Number(elderlyId), healthRecordName, columnName);
    return await this.healthRecordService.getHealthAnalytics(Number(elderlyId), healthRecordName, columnName, timespan);
  }

  @UseGuards(CaretakerGuard)
  @ApiOkResponse({ type: HealthRecordAnalyticsDto })
  @ApiNotFoundResponse({ description: 'Elderly Does Not Exist' })
  @ApiNotFoundResponse({ description: 'Health Column Name Not Found' })
  @ApiNotFoundResponse({ description: 'Health Record Name Not Found' })
  @ApiParam({ name: 'elderlyId', type: String, description: 'id of elderly user wants to query' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'columnName', type: String, description: 'column name in health record user wants to query' })
  @ApiParam({ name: 'timespan', type: String, enum: Timespan, description: 'timespan of data user wants to query' })
  @Get('analytics/:elderlyId/:healthRecordName/:columnName/:timespan')
  async getHealthAnalyticsByCaretaker(
    @Param('elderlyId') elderlyId: string,
    @Param('healthRecordName') healthRecordName: string,
    @Param('columnName') columnName: string,
    @Param('timespan') timespan: Timespan = Timespan.Year,
    @Request() req
  ): Promise<HealthRecordAnalyticsDto> {
    const caretakerId = req.user.uid;
    await this.userService.checkRelationship(Number(elderlyId), caretakerId);
    await this.healthRecordService.checkHealthRecordExist(Number(elderlyId), healthRecordName);
    await this.healthRecordService.checkHealthColumnExist(Number(elderlyId), healthRecordName, columnName);
    return await this.healthRecordService.getHealthAnalytics(Number(elderlyId), healthRecordName, columnName, timespan);
  }

  @ApiNotFoundResponse({ description: 'Column not found' })
  @ApiConflictResponse({ description: 'Health data at that timestamp already exists' })
  @ApiOkResponse({ type: Boolean })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Post('/healthData/elderly')
  async addHealthDataByElderly(@Request() req, @Body() addHealthDataDto: AddHealthDataDto, @Res() res): Promise<string> {
    await this.healthRecordService.addHealthData(req.user.uid, addHealthDataDto);
    return res.status(201).json({
      statusCode: 201,
      message: "Create health data successfully"
    })
  }

  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiParam({ name: 'eid', type: Number, description: 'id of elderly interested' })
  @ApiNotFoundResponse({ description: 'Column not found' })
  @ApiConflictResponse({ description: 'Health data at that timestamp already exists' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(CaretakerGuard)
  @Post('/healthData/caretaker/:eid')
  async addHealthDataByCaretaker(@Request() req, @Body() addHealthDataDto: AddHealthDataDto, @Res() res, @Param('eid') eid): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    await this.healthRecordService.addHealthData(eid, addHealthDataDto);
    return res.status(201).json({
      statusCode: 201,
      message: "Create health data successfully"
    })
  }

  @ApiNotFoundResponse({ description: 'Health data not found' })
  @ApiOkResponse({ type: Boolean })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Delete('/healthData/elderly')
  async deleteHealthDataByElderly(@Request() req, @Body() deleteHealthDataDto: DeleteHealthDataDto, @Res() res): Promise<string> {
    await this.healthRecordService.deleteHealthData(req.user.uid, deleteHealthDataDto);
    return res.status(200).json({
      statusCode: 200,
      message: "Delete health data successfully"
    })
  }

  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiParam({ name: 'eid', type: Number, description: 'id of elderly interested' })
  @ApiNotFoundResponse({ description: 'Health data not found' })
  @ApiOkResponse({ type: Boolean })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(CaretakerGuard)
  @Delete('/healthData/caretaker/:eid')
  async deleteHealthDataByCaretaker(@Request() req, @Body() deleteHealthDataDto: DeleteHealthDataDto, @Res() res, @Param('eid') eid): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    await this.healthRecordService.deleteHealthData(eid, deleteHealthDataDto);
    return res.status(200).json({
      statusCode: 200,
      message: "Delete health data successfully"
    })
  }

  @ApiNotFoundResponse({ description: 'Health record not found' })
  @ApiBadRequestResponse({ description: 'Image too large'})
  @ApiOkResponse({ type: String })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Put('/healthRecord/elderly')
  async editHealthRecordByElderly(@Request() req, @Body() editHealthRecordDto: EditHealthRecordDto): Promise<string> {
    return await this.healthRecordService.editHealthRecord(req.user.uid, editHealthRecordDto);
  }

  @ApiParam({ name: 'eid', type: Number, description: 'id of elderly interested' })
  @ApiNotFoundResponse({ description: 'Health record not found' })
  @ApiBadRequestResponse({ description: 'Image too large'})
  @ApiOkResponse({ type: String })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Put('/healthRecord/caretaker/:eid')
  async editHealthRecordByCaretaker(@Request() req, @Body() editHealthRecordDto: EditHealthRecordDto, @Param('eid') eid): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    return await this.healthRecordService.editHealthRecord(eid, editHealthRecordDto);
  }

}
