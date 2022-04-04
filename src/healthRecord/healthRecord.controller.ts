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
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @Get('/:healthRecordName')
  async getHealthDataByElderly(@Param('healthRecordName') healthRecordName: string, @Request() req): Promise<HealthRecordTableDto> {
    const userId = req.user.uid;
    return await this.healthRecordService.getHealthData(userId, healthRecordName);
  }

  @UseGuards(CaretakerGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiNotFoundResponse({ description: 'Elderly Does Not Exist' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'elderlyId', type: String, description: 'id of elderly interested' })
  @Get('/:elderlyId/:healthRecordName')
  async getHealthDataByCaretaker(
    @Param('elderlyId') elderlyId: string,
    @Param('healthRecordName') healthRecordName: string,
    @Request() req
  ): Promise<HealthRecordTableDto> {
    const caretakerId = req.user.uid;
    await this.userService.checkRelationship(Number(elderlyId), Number(caretakerId));
    return await this.healthRecordService.getHealthData(Number(elderlyId), healthRecordName);
  }

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordAnalyticsDto })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'columnName', description: 'column name in health record user wants to query' })
  @ApiParam({ name: 'timespan', type: String, enum: Timespan, description: 'timespan of data user wants to query' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('analytics/:healthRecordName/:columnName/:timespan')
  async getHealthAnalyticsByElderly(
    @Param('healthRecordName') healthRecordName: string,
    @Param('columnName') columnName: string,
    @Param('timespan') timespan: Timespan = Timespan.Year,
    @Request() req
  ): Promise<HealthRecordAnalyticsDto> {
    const userId = req.user.uid;
    return await this.healthRecordService.getHealthAnalytics(userId, healthRecordName, columnName, timespan);
  }

  @UseGuards(CaretakerGuard)
  @ApiOkResponse({ type: HealthRecordAnalyticsDto })
  @ApiParam({ name: 'elderlyId', type: String, description: 'id of elderly user wants to query' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'columnName', type: String, description: 'column name in health record user wants to query' })
  @ApiParam({ name: 'timespan', type: String, enum: Timespan, description: 'timespan of data user wants to query' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('analytics/:elderId/:healthRecordName/:columnName/:timespan')
  async getHealthAnalyticsByCaretaker(
    @Param('elderlyId') elderlyId: string,
    @Param('healthRecordName') healthRecordName: string,
    @Param('columnName') columnName: string,
    @Param('timespan') timespan: Timespan = Timespan.Year,
    @Request() req
  ): Promise<HealthRecordAnalyticsDto> {
    const caretakerId = req.user.uid;
    await this.userService.checkRelationship(Number(elderlyId), caretakerId);
    return await this.healthRecordService.getHealthAnalytics(Number(elderlyId), healthRecordName, columnName, timespan);
  }
}
