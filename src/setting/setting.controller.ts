import { Body, Controller, Put, Req, Res } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';

@Controller('setting')
export class SettingController {

  constructor(private readonly settingService: SettingService) { }

  @Put("/changePassword")
  async changeUserPassword(@Body() passwordDto: ChangePasswordDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changeUserPassword(passwordDto, req.user.uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed password successfully"
    })
  }
  @Put("/changePhoneNumber")
  async changePhoneNumber(@Body() phoneDto: ChangePhoneNoDto, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changePhoneNumber(phoneDto, req.user.uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed phone number successfully"
    })
  }
}
