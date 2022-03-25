import { Controller, Get, Post, Body, Delete, UsePipes, ValidationPipe, HttpCode, Request, UseGuards, Patch } from '@nestjs/common';
import { UserService } from './user.service';
import { UserDto, UpdateRelationshipDto, LoginDto, CreateUserDto, AuthResponse } from './dto/user.dto';
import { ApiBadRequestResponse, ApiBearerAuth, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiOkResponse, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';
import { PersonalInfo } from './user.interface';

@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) {}

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @Get()
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getPersonalInfo(@Request() req): Promise<UserDto> {
    const uid = req.user.uid;
    console.log(uid);
    const user = await this.userService.findOne({ uid }, { shouldExist: true });
    return this.userService.schemaToDto(user, UserDto);
  }

  @ApiBearerAuth()
  @UseGuards(ElderlyGuard)
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @ApiForbiddenResponse({ description: 'Forbidden'})
  @Get('/relationship/caretaker')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getCaretakersByElderlyId(@Request() req) {
    const eid = req.user.uid;
    const users = await this.userService.findCaretakerByElderlyId(eid);
    return users.map((user) => this.userService.schemaToDto(user, UserDto));
  }

  @UseGuards(CaretakerGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @ApiForbiddenResponse({ description: 'Forbidden'})
  @Get('/relationship/elderly')
  @ApiOkResponse({ type: [UserDto] })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  async getElderlyByCaretakerId(@Request() req) {
    const cid = req.user.uid;
    const users = await this.userService.findElderlyByCaretakerId(cid);
    return users.map((user) => this.userService.schemaToDto(user, UserDto));
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @Post('relationship')
  @HttpCode(201)
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body);
    return this.userService.schemaToDto(createdUser, UserDto);
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @Delete('relationship')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body);
    return this.userService.schemaToDto(updatedUser, UserDto);
  }

  @ApiOkResponse({ description: 'Log in Successfully' })
  @ApiBadRequestResponse({ description: "Phone number or password doesn't exist" })
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
  @ApiConflictResponse({ description: 'Phone number already exists' })
  @Post('signUp')
  async signUp(@Body() signUpDto: CreateUserDto): Promise<AuthResponse> {
    const { uid, role } = await this.userService.createUser(signUpDto);
    const token = await this.authService.generateJWT(uid, role);

    const res: AuthResponse = {
      token: token,
    };
    return res;
  }

  @UseGuards(UserGuard)
  @ApiOkResponse({ description: "Information Updated"})
  @ApiUnauthorizedResponse({ description: "Unauthorized"})
  @ApiBearerAuth()
  @Patch()
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUserInfo(@Body() updateDto: PersonalInfo, @Request() req): Promise<PersonalInfo> {
    const uid = req.user.uid;
    const updatedUser = await this.userService.updateUser({ uid, ...updateDto });
    return updatedUser;
  }

  // @UseInterceptors(FileInterceptor('file', { limits: { fileSize: 20000000 } }))
  // @Post('/profile/:uid/image')
  // @ApiOkResponse({ type: UploadProfileResponse })
  // @ApiBadRequestResponse({ description: 'Image too large OR Invalid image type' })
  // async uploadProfilePicture(
  //   @UploadedFile() file: Express.Multer.File,
  //   @Param('uid') uid: number
  // ): Promise<UploadProfileResponse> {
  //   //TODO: Get uid from token
  //   const imageUrl = await this.userService.uploadProfilePicture(uid, file)
  //   return imageUrl
  // }
}
