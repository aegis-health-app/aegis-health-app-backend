import { Body, Controller, Post, Get, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import { ApiParam, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger'
import { OtpDTO } from './dto/auth.dto'
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @ApiParam({ name: 'phoneNumber', type: String, description: "user's phone number" })
  @ApiOkResponse({ description: 'OTP Successfully Sent' })
  @ApiBadRequestResponse({ description: 'Failed Requesting OTP' })
  @Get('/getOtp/:phoneNumber')
  getOTP(@Param('phoneNumber') phoneNumber: string) {
    return this.authService.getOtp(phoneNumber)
  }

  @ApiBody({ type: OtpDTO })
  @ApiOkResponse({ description: 'Verified Successfully' })
  @ApiUnauthorizedResponse({ description: 'Failed Verifying OTP' })
  @Post('/verifyOtp')
  verifyOTP(@Body() body: { token: string; pin: string }) {
    return this.authService.verifyOtp(body.token, body.pin)
  }
}
