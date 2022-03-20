import { Controller, Get, Post, Body, Param, Delete } from '@nestjs/common'
import { UserService } from './user.service'
import { UpdateRelationshipDto } from './dto/update-user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('caretaker/:eid')
  async getCaretakers(@Param('eid') uid: number) {
    return await this.userService.findCaretakerByElderlyId(uid)
  }
  @Get('elderly/:cid')
  async getElderly(@Param('cid') cid: number) {
    return await this.userService.findElderlyByCaretakerId(cid)
  }
  @Post('relationship')
  async addRelationship(@Body() body: UpdateRelationshipDto) {
    return await this.userService.addRelationship(body)
  }
  @Delete('relationship')
  async removeRelationship(@Body() body: UpdateRelationshipDto) {
    return await this.userService.removeRelationship(body)
  }
}
