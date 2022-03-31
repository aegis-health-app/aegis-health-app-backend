import { BadRequestException, Controller, Get, Param, Request, UseGuards } from '@nestjs/common';
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
import { ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';
import { HealthRecordService } from './healthRecord.service';
import { UserService } from 'src/user/user.service';
import { HealthRecordDto } from './dto/healthRecord.dto';

@ApiBearerAuth()
@ApiTags("health record")
@ApiUnauthorizedResponse({ description: 'Unauthorized' })
@ApiForbiddenResponse({ description: 'Forbidden' })
@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService, private readonly userService: UserService) {}

  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: HealthRecordDto })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @Get('/:healthRecordName')
  async getHealthDatadByElderly(@Param('healthRecordName') healthRecordName: string, @Request() req): Promise<HealthRecordDto> {
    const userId = req.user.uid;
    return await this.healthRecordService.getHealthData(userId, healthRecordName);
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ type: HealthRecordDto })
  @ApiBadRequestResponse({ description: "Caretaker doesn't have access to this elderly" })
  @ApiNotFoundResponse({ description: 'Elderly Does Not Exist' })
  @ApiParam({ name: 'healthRecordName', type: String, description: 'health record name user wants to find' })
  @ApiParam({ name: 'elderlyId', type: Number, description: 'id of elderly interested' })
  @Get('/:elderlyId/:healthRecordName')
  async getHealthDataByCaretaker(
    @Param('elderlyId') elderlyId,
    @Param('healthRecordName') healthRecordName: string,
    @Request() req
  ): Promise<HealthRecordDto> {
    const caretakerId = req.user.uid;
    const isRelated = await this.userService.checkRelationship(elderlyId, caretakerId);
    if (!isRelated) {
      throw new BadRequestException("Caretaker doesn't have access to this elderly");
    }
    return await this.healthRecordService.getHealthData(elderlyId, healthRecordName);
  }
}
