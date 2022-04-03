import { BadRequestException, Body, Controller, Delete, Get, Param, Post, Put, Request, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';
import { HealthRecordService } from './healthRecord.service';
import { UserService } from 'src/user/user.service';
import { AddHealthDataDto, DeleteHealthDataDto, EditHealthRecordDto, HealthRecordTableDto } from './dto/healthRecord.dto';

@ApiBearerAuth()
@ApiTags("health record")
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService, private readonly userService: UserService) { }

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @Get('/:healthRecordName')
  async getHealthDataByElderly(@Param('healthRecordName') healthRecordName: string, @Request() req): Promise<HealthRecordTableDto> {
    const userId = req.user.uid;
    return await this.healthRecordService.getHealthData(userId, healthRecordName);
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiNotFoundResponse({ description: 'Elderly Does Not Exist' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'elderlyId', type: Number, description: 'id of elderly interested' })
  @Get('/:elderlyId/:healthRecordName')
  async getHealthDataByCaretaker(
    @Param('elderlyId') elderlyId,
    @Param('healthRecordName') healthRecordName: string,
    @Request() req
  ): Promise<HealthRecordTableDto> {
    const caretakerId = req.user.uid;
    await this.userService.checkRelationship(elderlyId, caretakerId);
    return await this.healthRecordService.getHealthData(elderlyId, healthRecordName);
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
  @Delete('/healthData/elderly/:eid')
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
  @Put('/healthRecord/elderly/:eid')
  async editHealthRecordByCaretaker(@Request() req, @Body() editHealthRecordDto: EditHealthRecordDto, @Param('eid') eid): Promise<string> {
    await this.userService.checkRelationship(eid, req.user.uid);
    return await this.healthRecordService.editHealthRecord(eid, editHealthRecordDto);
  }

}
