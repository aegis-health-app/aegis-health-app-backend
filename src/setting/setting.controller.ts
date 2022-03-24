import { Body, Param, Controller, Put, Req, Res } from '@nestjs/common';
import { SettingService } from './setting.service';
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';
import { ApiBearerAuth, ApiBody, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger'
import { UUIDVersion } from 'class-validator';

@Controller('setting')
export class SettingController {

  constructor(private readonly settingService: SettingService) { }

  // @ApiBody({ type: ChangePasswordDto })
  // @ApiBearerAuth()
  // @ApiOkResponse({ description: 'Succesful In Changing Password' })
  // @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
  // @Put("/changePassword")
  // async changeUserPassword(@Body() passwordDto: ChangePasswordDto, @Req() req, @Res() res): Promise<string> {
  //   await this.settingService.changeUserPassword(passwordDto, req.user.uid)
  //   return res.status(200).json({
  //     statusCode: 200,
  //     message: "Changed password successfully"
  //   })
  // }

  @ApiBody({ type: ChangePasswordDto }) // this one works
  @ApiBearerAuth()
  @ApiOkResponse({ description: 'Succesful In Changing Password' })
  @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
  @Put('/changePassword/:uid')
  async changeUserPassword(@Body() passwordDto: ChangePasswordDto, @Param("uid") uid: number, @Res() res): Promise<string> {
    await this.settingService.changeUserPassword(passwordDto, uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed password successfully"
    })
  }

  // @ApiBody({ type: ChangePhoneNoDto })
  // @ApiBearerAuth()
  // @ApiOkResponse({ description: 'Succesful In Changing Phone Number' })
  // @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
  // @Put("/changePhoneNumber")
  // async changePhoneNumber(@Body() phoneDto: ChangePhoneNoDto, @Req() req, @Res() res): Promise<string> {
  //   await this.settingService.changePhoneNumber(phoneDto, req.user.uid, req.user.token)
  //   return res.status(200).json({
  //     statusCode: 200,
  //     message: "Changed phone number successfully"
  //   })
  // }

  @ApiBody({ type: ChangePhoneNoDto })
  @ApiOkResponse({ description: 'Succesful In Changing Phone Number' })
  @ApiUnauthorizedResponse({ description: 'Failed To Change Password' })
  @Put("/changePhoneNumber/:uid")
  async changePhoneNumber(@Body() phoneDto: ChangePhoneNoDto,@Param("uid") uid: number, @Req() req, @Res() res): Promise<string> {
    await this.settingService.changePhoneNumber(phoneDto, uid, req.user.token)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed phone number successfully"
    })
  }

}

