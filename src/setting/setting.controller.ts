import { Body, Controller, Put, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { UserGuard } from 'src/auth/jwt.guard';

@Controller('setting')
export class SettingController {

  constructor(private readonly settingService: SettingService) { }

  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Succesful In Changing Password' })
  @ApiBadRequestResponse({ description: 'Old Password is the New Password' })
  @ApiUnauthorizedResponse({ description: 'Must Login To Change Password' })
  @ApiConflictResponse({ description: 'Old Password Entered is Incorrect' })
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/changePassword')
  async changeUserPassword(@Body() passwordDto: ChangePasswordDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changeUserPassword(passwordDto, req.user.uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed password successfully"
    })
  }

  @ApiBody({ type: ChangePhoneNoDto })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Succesful In Changing Phone Number' })
  @ApiBadRequestResponse({ description: 'Old Phone Number is the New Phone Number' })
  @ApiUnauthorizedResponse({ description: 'Must Login To Change Phone Number' })
  @ApiForbiddenResponse({ description: 'PIN Entered is Incorrect' })
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put("/changePhoneNumber")
  async changePhoneNumber(@Body() phoneDto: ChangePhoneNoDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changePhoneNumber(phoneDto, req.user.uid, req.user.token)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed phone number successfully"
    })
  }

}

