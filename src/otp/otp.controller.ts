import { Body, Controller, Post, Get, Param } from '@nestjs/common';
import { OtpService } from './otp.service';
import { ApiParam, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger';
import { OtpDTO } from './dto/otp.dto';
@Controller('otp')
export class OtpController {
  constructor(private otpService: OtpService) {}

  @ApiParam({ name: 'phoneNumber', type: String, description: "user's phone number" })
  @ApiOkResponse({ description: 'OTP Successfully Sent' })
  @ApiBadRequestResponse({ description: 'Failed Requesting OTP' })
  @Get('/request/:phoneNumber')
  getOTP(@Param('phoneNumber') phoneNumber: string) {
    return this.otpService.getOtp(phoneNumber);
  }

  @ApiBody({ type: OtpDTO })
  @ApiOkResponse({ description: 'Verified Successfully' })
  @ApiUnauthorizedResponse({ description: 'Failed Verifying OTP' })
  @Post('/verifyOtp')
  verifyOTP(@Body() body: { token: string; pin: string }) {
    return this.otpService.verifyOtp(body.token, body.pin);
  }
}
