<<<<<<< HEAD
import {  Controller, Get, Param, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
=======
import { BadRequestException, Controller, Get, Param, Request, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
>>>>>>> implement health analytics
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
import { HealthRecordTableDto, Timespan } from './dto/healthRecord.dto';

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

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordTableDto })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'columnName', description: 'column name in health record user wants to query' })
  @ApiParam({ name: 'timespan', description: 'timespan of data user wants to query' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('/:healthRecordName/:columnName/:timespan')
  async getHealthAnalyticsByElderly(
    @Param('healthRecordName') healthRecordName: string,
    @Param('columnName') columnName: string,
    @Param('timespan') timespan: string = Timespan.Year,
    @Request() req
  ): Promise<HealthRecordTableDto> {
    const userId = req.user.uid;
    return await this.healthRecordService.getHealthAnalytics(userId, healthRecordName, columnName, timespan);
  }
}
