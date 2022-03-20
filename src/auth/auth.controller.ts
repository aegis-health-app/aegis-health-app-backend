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

// @Post("/login")
//   async login(@Body() loginUserDto: LoginUserDto, @Res() res): Promise<string> {
//     const user = await this.userService.login(loginUserDto.username, loginUserDto.password)
//     return res.status(201).json({
//       statusCode: 201,
//       message: "Login successfully",
//       jwt: this.authService.generateJWT(user["_id"], "User"),
//       is_thai_language: user["is_thai_language"],
//     })
//   }
