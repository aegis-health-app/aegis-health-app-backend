import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, Put, HttpCode } from '@nestjs/common'
import { UserService } from './user.service'
import { CreateUserResponse, UserDto, UpdateRelationshipDto, GetUserRequest } from './dto/user.dto'
import { CreateUserDto } from './dto/user.dto'
import { ApiBadRequestResponse, ApiOkResponse, refs } from '@nestjs/swagger'
import { PersonalInfo } from './user.interface'
import { plainToInstance } from 'class-transformer'

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
  @Put()
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true, transformOptions: { excludeExtraneousValues: true } }))
  async updatePersonalInfo(@Body() body: UserDto) {
    const updatedUser = await this.userService.updateUser(body)
    return this.userService.schemaToDto(updatedUser, UserDto)
  }
  @Post()
  @HttpCode(201)
  @ApiOkResponse({ type: CreateUserResponse })
  @ApiBadRequestResponse({ description: 'Phone number already exists' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createUser(@Body() body: CreateUserDto) {
    return await this.userService.createUser(body)
  }
  @Get('/relationship/caretaker/:eid')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getCaretakersByElderlyId(@Param('eid') eid: number) {
    //TODO: Get uid from token
    const users = await this.userService.findCaretakerByElderlyId(eid)
    return users.map((user) => this.userService.schemaToDto(user, UserDto))
  }
  @Get('/relationship/elderly/:cid')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getElderlyByCaretakerId(@Param('cid') cid: number) {
    //TODO: Get uid from token
    const users = await this.userService.findElderlyByCaretakerId(cid)
    return users.map((user) => this.userService.schemaToDto(user, UserDto))
  }
  @Post('relationship')
  @HttpCode(201)
  @ApiBadRequestResponse({ description: 'Relatioship already exists' })
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body)
    return this.userService.schemaToDto(createdUser, UserDto)
  }
  @Delete('relationship')
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body)
    return this.userService.schemaToDto(updatedUser, UserDto)
  }
}
