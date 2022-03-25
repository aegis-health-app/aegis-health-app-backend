import { Controller, Get, Post, Body, Param, Delete, UsePipes, ValidationPipe, HttpCode, Request, UseGuards } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UpdateRelationshipDto, LoginDto, CreateUserDto, AuthResponse } from './dto/user.dto';
import { ApiBadRequestResponse, ApiCreatedResponse, ApiOkResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @UseGuards(UserGuard)
  @Get()
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getPersonalInfo(@Request() req): Promise<UserDto> {
    const uid = req.user.userId;
    const user = await this.userService.findOne({ uid }, { shouldExist: true });
    return this.userService.schemaToDto(user, UserDto);
  }

  @UseGuards(ElderlyGuard)
  @Get('/relationship/caretaker')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getCaretakersByElderlyId(@Request() req) {
    const eid = req.user.userId;
    const users = await this.userService.findCaretakerByElderlyId(eid);
    return users.map((user) => this.userService.schemaToDto(user, UserDto));
  }

  @UseGuards(CaretakerGuard)
  @Get('/relationship/elderly')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getElderlyByCaretakerId(@Request() req) {
    const cid = req.user.userId;
    const users = await this.userService.findElderlyByCaretakerId(cid);
    return users.map((user) => this.userService.schemaToDto(user, UserDto));
  }

  @Post('relationship')
  @HttpCode(201)
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body);
    return this.userService.schemaToDto(createdUser, UserDto);
  }

  @Delete('relationship')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body);
    return this.userService.schemaToDto(updatedUser, UserDto);
  }

  @ApiOkResponse({ description: 'Log in Successfully' })
  @ApiBadRequestResponse({description: "Phone number or password doesn't exist"})
  @Post('login')
  async login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    const { uid, role } = await this.userService.login(loginDto.phone, loginDto.password);
    const token = await this.authService.generateJWT(uid, role);

    const res: AuthResponse = {
      token: token,
    };
    return res;
  }

  @ApiCreatedResponse({ description: 'Sign up Successfully' })
  @Post('signUp')
  async signUp(@Body() signUpDto: CreateUserDto): Promise<AuthResponse> {
    const { uid, role } = await this.userService.createUser(signUpDto);
    const token = await this.authService.generateJWT(uid, role);

    const res: AuthResponse = {
      token: token,
    };
    return res;
  }
}
