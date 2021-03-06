import { Controller, Get, Post, Body, UseGuards, UsePipes, ValidationPipe, Req } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { CreateEmergencyRequest, CreateEmergencyResponse } from './dto/create-emergency.dto';
import { ApiTags, ApiOkResponse, ApiBody, ApiBadRequestResponse, ApiBearerAuth } from '@nestjs/swagger';
import { ElderlyGuard } from 'src/auth/jwt.guard';

@ApiTags('notification')
@Controller('notification/emergency')
export class EmergencyController {
  constructor(private readonly emergencyService: EmergencyService) {}
  @UseGuards(ElderlyGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOkResponse({ type: CreateEmergencyResponse })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Unregistered Device OR User not found OR Invalid user type' })
  @ApiBody({ type: CreateEmergencyRequest })
  @Post()
  async notify(@Body() createEmergencyDto: CreateEmergencyRequest, @Req() req): Promise<CreateEmergencyResponse> {
    const res = await this.emergencyService.notifyEmergency(createEmergencyDto, req.user.uid);
    return { successes: res.successCount, fails: res.failureCount };
  }
  @UseGuards(ElderlyGuard)
  @ApiOkResponse({ type: CreateEmergencyResponse })
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Unregistered Device OR User not found OR Invalid user type' })
  @Get('/cancel')
  async cancelNotification(@Req() req): Promise<CreateEmergencyResponse> {
    const res = await this.emergencyService.cancelEmergencyNotification(req.user.uid);
    return { successes: res.successCount, fails: res.failureCount };
  }
}
