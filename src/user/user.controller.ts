import {
  Controller,
  Get,
  Post,
  Body,
  Delete,
  UsePipes,
  ValidationPipe,
  HttpCode,
  Request,
  UseGuards,
  Patch,
  UseInterceptors,
  UploadedFile,
  Put,
  Res,
  Req,
  Param,
} from '@nestjs/common';
import { UserService } from './user.service';
import {
  UserDto,
  UpdateRelationshipDto,
  LoginDto,
  CreateUserDto,
  AuthResponse,
  UploadProfileResponse,
  UpdateUserProfileDto,
  UploadProfileRequest,
  ForgotPasswordDto,
} from './dto/user.dto';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
import { AuthService } from 'src/auth/auth.service';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';
import { PersonalInfo } from './user.interface';
import { FileInterceptor } from '@nestjs/platform-express';
@ApiTags('user')
@Controller('user')
export class UserController {
  constructor(private readonly userService: UserService, private readonly authService: AuthService) { }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Get('profile')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found' })
  async getPersonalInfo(@Request() req): Promise<UserDto> {
    const uid = req.user.uid;
    const user = await this.userService.findOne({ uid }, { shouldExist: true });
    return this.userService.schemaToDto(user, UserDto);
  }

  @ApiBearerAuth()
  @UseGuards(ElderlyGuard)
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiForbiddenResponse({ description: 'Forbidden' })
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
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('relationship')
  @HttpCode(201)
  @ApiBody({ type: UpdateRelationshipDto })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @ApiOkResponse({ type: UserDto })
  @UsePipes(new ValidationPipe({ transform: true }))
  async createRelationship(@Body() body: UpdateRelationshipDto) {
    const createdUser = await this.userService.createRelationship(body);
    return this.userService.schemaToDto(createdUser, UserDto);
  }

  @ApiBearerAuth()
  @UseGuards(UserGuard)
  @ApiBody({ type: UpdateRelationshipDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Delete('relationship')
  @ApiOkResponse({ type: UserDto })
  @ApiBadRequestResponse({ description: 'User not found OR Invalid user type' })
  @UsePipes(new ValidationPipe({ transform: true }))
  async deleteRelationship(@Body() body: UpdateRelationshipDto) {
    const updatedUser = await this.userService.deleteRelationship(body);
    return this.userService.schemaToDto(updatedUser, UserDto);
  }

  @HttpCode(200)
  @ApiOkResponse({ description: 'Log in Successfully', type: AuthResponse })
  @ApiBody({ type: LoginDto })
  @ApiBadRequestResponse({ description: "Phone number or password doesn't exist" })
  @UsePipes(new ValidationPipe({ whitelist: true }))
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
  @ApiBody({ type: CreateUserDto })
  @ApiConflictResponse({ description: 'Phone number already exists' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
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
  @ApiOkResponse({ type: UserDto })
  @ApiBody({ type: UpdateUserProfileDto })
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @ApiBearerAuth()
  @Patch('profile')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async updateUserInfo(@Body() updateDto: UpdateUserProfileDto, @Request() req): Promise<UserDto> {
    const uid = req.user.uid;
    const updatedUser = await this.userService.updateUser({ uid, ...updateDto });
    return this.userService.schemaToDto(updatedUser, UserDto);
  }

  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiUnauthorizedResponse({ description: 'Unauthorized' })
  @Post('profile/image')
  @ApiBody({ type: UploadProfileRequest })
  @ApiOkResponse({ type: UploadProfileResponse })
  @ApiBadRequestResponse({ description: 'Image too large' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Invalid image type' })
  async uploadProfilePicture(@Body() dto: UploadProfileRequest, @Request() req): Promise<UploadProfileResponse> {
    const imageUrl = await this.userService.uploadProfilePicture(req.user.uid, dto);
    return imageUrl;
  }

  @ApiOperation({ description: 'Verify that the phone number exists' })
  @ApiOkResponse({ description: 'Phone number exists' })
  @ApiBadRequestResponse({ description: 'This phone number does not exist' })
  @Get('/verifyPhoneNoExist/:phoneNo')
  async verifyPasswordExist(@Param('phoneNo') phoneNo: string, @Res() res): Promise<string> {
    await this.userService.verifyPhoneNoExist(phoneNo)
    return res.status(200).json({
      statusCode: 200,
      message: "Phone number exists"
    })
  }

  @ApiOperation({ description: 'Change password of an account that is not signed in' })
  @ApiBody({ type: ForgotPasswordDto })
  @ApiOkResponse({ description: 'Changed forgot password successfully' })
  @ApiBadRequestResponse({ description: 'New password entered is the old password' })
  // @ApiForbiddenResponse({ description: 'PIN entered is incorrect' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Put('/forgotPassword')
  async forgotPassword(@Body() forgotPasswordDto: ForgotPasswordDto, @Req() req, @Res() res): Promise<string> {
    await this.userService.forgotPassword(forgotPasswordDto)
    return res.status(200).json({
      statusCode: 200,
      message: "Changed forgot password successfully"
    })
  }

}
