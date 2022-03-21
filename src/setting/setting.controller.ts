import { Body, Controller, Put, Req, Res } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';
import { ApiParam, ApiBody, ApiOkResponse, ApiUnauthorizedResponse, ApiBadRequestResponse } from '@nestjs/swagger'

@Controller('setting')
export class SettingController {

  constructor(private readonly settingService: SettingService) { }

  // @ApiBody({ type: ChangePasswordDto })
  @ApiOkResponse({ description: 'Succesful In Changing Password' }) // 200
  @ApiUnauthorizedResponse({ description: 'Failed To Change Password' }) // 401
  @Put("/changePassword")
  async changeUserPassword(@Body() passwordDto: ChangePasswordDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changeUserPassword(passwordDto, req.user.uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed password successfully"
    })
  }

  @ApiOkResponse({ description: 'Succesful In Changing Phone Number' })
  @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
  @Put("/changePhoneNumber")
  async changePhoneNumber(@Body() phoneDto: ChangePhoneNoDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changePhoneNumber(phoneDto, req.user.uid, req.user.token)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed phone number successfully"
    })
  }
}

