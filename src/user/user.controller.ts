import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, HttpCode } from '@nestjs/common'
import { UserService } from './user.service'
import { UserDto, UpdateRelationshipDto } from './dto/user.dto'
import { ApiBadRequestResponse, ApiOkResponse } from '@nestjs/swagger'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':uid')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getPersonalInfo(@Param('uid') uid: number): Promise<UserDto> {
    //TODO: Get uid from token
    const user = await this.userService.findOne({ uid }, { shouldExist: true })
    return this.userService.schemaToDto(user, UserDto)
  }
  @Get('/relationship/caretaker/:eid')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getCaretakersByElderlyId(@Param('eid') eid: number) {
    //TODO: Get uid from token
    const users = await this.userService.findCaretakerByElderlyId(eid)
    return users.map((user) => this.userService.schemaToDto(user, UserDto))
  }
  @Get('/relationship/elderly/:cid')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getElderlyByCaretakerId(@Param('cid') cid: number) {
    //TODO: Get uid from token
    const users = await this.userService.findElderlyByCaretakerId(cid)
    return users.map((user) => this.userService.schemaToDto(user, UserDto))
  }
  @Post('relationship')
  @HttpCode(201)
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body)
    return this.userService.schemaToDto(createdUser, UserDto)
  }
  @Delete('relationship')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body)
    return this.userService.schemaToDto(updatedUser, UserDto)
  }
}
