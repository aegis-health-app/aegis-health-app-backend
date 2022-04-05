import { Controller, Get, Param, Request, Type, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiParam,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CaretakerGuard, ElderlyGuard } from 'src/auth/jwt.guard';
import { HealthRecordService } from './healthRecord.service';
import { UserService } from 'src/user/user.service';
import { HealthRecordAnalyticsDto, HealthRecordTableDto, Timespan } from './dto/healthRecord.dto';

@ApiBearerAuth()
@ApiTags('health record')
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService, private readonly userService: UserService) {}

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
    console.log(elderlyId);
    await this.userService.checkRelationship(Number(elderlyId), caretakerId);
    await this.healthRecordService.checkHealthRecordExist(Number(elderlyId), healthRecordName);
    await this.healthRecordService.checkHealthColumnExist(Number(elderlyId), healthRecordName, columnName);
    return await this.healthRecordService.getHealthAnalytics(Number(elderlyId), healthRecordName, columnName, timespan);
  }
}
