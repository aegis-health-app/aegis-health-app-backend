import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyRequest, CreateEmergencyResponse } from './dto/create-emergency.dto';
import { ApiTags, ApiOkResponse, ApiBody, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ElderlyGuard } from 'src/auth/jwt.guard';

@ApiTags('emergency')
@Controller('emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOkResponse({ type: CreateEmergencyResponse })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Unregistered Device' })
  @ApiBody({ type: CreateEmergencyRequest })
  @Post('notify')
  async notify(@Body() createEmergencyDto: CreateEmergencyRequest): Promise<CreateEmergencyResponse> {
    const res = await this.emergencyService.notifyEmergency(createEmergencyDto);
    return { successes: res.successCount, fails: res.failureCount };
  }
}
