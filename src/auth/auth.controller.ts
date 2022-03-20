import { Body, Controller, Post, Get, Param } from '@nestjs/common'
import { AuthService } from './auth.service'
import {ApiParam, ApiBody, ApiOkResponse, ApiUnauthorizedResponse} from '@nestjs/swagger'
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Get('/getOtp/:phoneNumber')
  getOTP(@Param('phoneNumber') phoneNumber: string) {
    return this.authService.getOtp(phoneNumber)
  }

//   @ApiBody({ type: {} })
  @ApiOkResponse({ description: "Verified Successfully" })
  @ApiUnauthorizedResponse({ description: "Failed Verifying OTP" })
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
