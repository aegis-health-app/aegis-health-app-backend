import { Controller, Post, Body, UsePipes, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { RegisterDeviceDto, RegisterDeviceResponse } from './dto/notification.dto';
import { UserGuard } from 'src/auth/jwt.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
@ApiTags('notification')
@Controller('notification')
export class NotificationController {
  constructor(private readonly notificationService: NotificationService) {}
  @UseGuards(UserGuard)
  @Post('/register-device')
  @ApiBody({ type: RegisterDeviceDto })
  @ApiOkResponse({ type: RegisterDeviceResponse })
  @ApiBearerAuth()
  @ApiOperation({ description: 'Allow device to send and receive notification from server' })
  @ApiBadRequestResponse({ description: 'Invalid token' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async registerDevice(@Body() body: RegisterDeviceDto, @Req() req): Promise<RegisterDeviceResponse> {
    const result = await this.notificationService.registerDevice(req.user.uid, body.registrationToken);
    return { success: !!result };
  }
}
