import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  UsePipes,
  ValidationPipe,
  ParseBoolPipe,
  Put,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UpdatePersonalInfoDto, UpdateRelationshipDto } from './dto/user.dto'
import { CreateUserDto } from './dto/user.dto'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('caretaker/:eid')
  async getCaretakersByElderlyId(@Param('eid') eid: number) {
    return await this.userService.findCaretakerByElderlyId(eid)
  }
  @Get('elderly/:cid')
  async getElderlyByCaretakerId(@Param('cid') cid: number) {
    return await this.userService.findElderlyByCaretakerId(cid)
  }
  @Post('relationship')
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    return await this.userService.createRelationship(body)
  }
  @Delete('relationship')
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    return await this.userService.deleteRelationship(body)
  }
  @Post()
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body)
  }
  @Put()
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }))
  async updatePersonalInfo(@Body() body: UpdatePersonalInfoDto) {
    return await this.userService.updateUser(body)
  }
}
