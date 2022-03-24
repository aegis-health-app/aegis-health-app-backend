import { Body, Param, Controller, Put, Req, Res, UsePipes, ValidationPipe } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { UUIDVersion } from 'class-validator';

@Controller('setting')
export class SettingController {

  constructor(private readonly settingService: SettingService) { }

  @ApiBody({ type: ChangePasswordDto })
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Succesful In Changing Password' })
  @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
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
  @ApiOkResponse({ description: 'Succesful In Changing Phone Number' })
  @ApiUnauthorizedResponse({ description: 'Failed To Change Phone Number' })
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

