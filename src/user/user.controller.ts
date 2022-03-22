import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Put, HttpCode } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserResponse, GetUserDto, UpdatePersonalInfoDto, UpdateRelationshipDto } from './dto/user.dto'
import { CreateUserDto } from './dto/user.dto'
import { ApiBadRequestResponse, ApiOkResponse, refs } from '@nestjs/swagger'

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService) {}
  @Get(':id')
  @ApiOkResponse({ type: GetUserDto })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getUser(@Param('id') id: number): Promise<GetUserDto> {
    const user = await this.userService.findOne({ uid: id }, { shouldExist: true })
    return this.userService.schemaToDto(user)
  }
  @Get('/relationship/caretaker/:eid')
  @ApiOkResponse({ type: [GetUserDto] })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getCaretakersByElderlyId(@Param('eid') eid: number) {
    const users = await this.userService.findCaretakerByElderlyId(eid)
    return users.map((user) => this.userService.schemaToDto(user))
  }
  @Get('/relationship/elderly/:cid')
  @ApiOkResponse({ type: [GetUserDto] })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getElderlyByCaretakerId(@Param('cid') cid: number) {
    const users = await this.userService.findElderlyByCaretakerId(cid)
    return users.map((user) => this.userService.schemaToDto(user))
  }
  @Post('relationship')
  @HttpCode(201)
  @ApiBadRequestResponse({ description: 'Relatioship already exists' })
  @ApiOkResponse({ type: GetUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body)
    return this.userService.schemaToDto(createdUser)
  }
  @Delete('relationship')
  @ApiOkResponse({ type: GetUserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body)
    return this.userService.schemaToDto(updatedUser)
  }
  @Post()
  @HttpCode(201)
  @ApiOkResponse({ type: CreateUserResponse })
  @ApiBadRequestResponse({ description: 'Phone number already exists' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body)
  }
  @Put()
  @ApiOkResponse({ type: GetUserDto })
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }))
  async updatePersonalInfo(@Body() body: UpdatePersonalInfoDto) {
    const updatedUser = await this.userService.updateUser(body)
    return this.userService.schemaToDto(updatedUser)
  }
}
