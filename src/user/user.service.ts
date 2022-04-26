import { BadRequestException, HttpException, HttpStatus, Injectable, NotFoundException, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { FindConditions, FindOneOptions, Repository } from 'typeorm';
import { UpdateRelationshipDto, CreateUserDto, IDto, UploadProfileResponse, UploadProfileRequest } from './dto/user.dto';
import { DuplicateElementException, InvalidUserTypeException, UserNotFoundException } from './user.exception';
import { plainToInstance } from 'class-transformer';
import { AuthService } from 'src/auth/auth.service';
import { Role } from 'src/common/roles';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { ALLOWED_PROFILE_FORMAT } from 'src/utils/global.constant';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { ForgotPassword, OTP } from './user.interface';
import * as bcrypt from 'bcrypt'
import { OtpService } from 'src/otp/otp.service';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User) private userRepository: Repository<User>,
    private authService: AuthService,
    private googleStorageService: GoogleCloudStorage,
    private otpService: OtpService,
  ) { }

  schemaToDto(schema: User, dtoClass: IDto<any>) {
    return plainToInstance(dtoClass, schema, { excludeExtraneousValues: true });
  }
  async findOne(
    conditions: FindConditions<User>,
    options?: FindOneOptions<User> & { shouldBeElderly?: boolean; shouldExist?: boolean }
  ): Promise<User> {
    const user = await this.userRepository.findOne(conditions, options);
    if (!options) return user;
    if (options.shouldExist && !user) throw new UserNotFoundException();
    if (options.shouldBeElderly !== undefined && ((options.shouldBeElderly && !user.isElderly) || (!options.shouldBeElderly && user.isElderly)))
      throw new InvalidUserTypeException();
    return user;
  }
  async createRelationship({ eid, cid }: UpdateRelationshipDto): Promise<User> {
    //TODO: validate uid from auth
    const caretaker = await this.findOne({ uid: cid }, { shouldBeElderly: false, shouldExist: true });
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true });
    if (elderly.takenCareBy.find((currentCaretaker) => currentCaretaker.uid === cid)) throw new DuplicateElementException('Relationship');
    elderly.takenCareBy.push(caretaker);
    return await this.userRepository.save(elderly);
  }
  async deleteRelationship({ eid, cid }: UpdateRelationshipDto): Promise<User> {
    //TODO: validate uid from auth
    await this.findOne({ uid: cid }, { shouldBeElderly: false });
    const elderly = await this.findOne({ uid: eid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true });
    const newCaretakers = elderly.takenCareBy.filter((c) => c.uid !== cid);
    return await this.userRepository.save({ ...elderly, takenCareBy: newCaretakers });
  }
  async findCaretakerByElderlyId(uid: number): Promise<User[]> {
    const elderly = await this.findOne({ uid: uid }, { relations: ['takenCareBy'], shouldBeElderly: true, shouldExist: true });
    return elderly.takenCareBy;
  }
  async findElderlyByCaretakerId(uid: number): Promise<User[]> {
    const caretaker = await this.findOne({ uid: uid }, { relations: ['takingCareOf'], shouldBeElderly: false, shouldExist: true });
    return caretaker.takingCareOf;
  }
  async createUser(dto: CreateUserDto): Promise<{ uid: number; role: Role }> {
    const existingUser = await this.findOne({ phone: dto.phone });
    if (existingUser) throw new DuplicateElementException('Phone number');
    const hashedPassword = await this.authService.hashPassword(dto.password);
    const user = this.userRepository.create({
      ...dto,
      password: hashedPassword,
      reminders: [],
      emotionalRecords: [],
      memoryPracticeQuestions: [],
      healthRecords: [],
      modules: [],
      takingCareOf: [],
      takenCareBy: [],
    });
    return (await this.userRepository.insert(user)).identifiers.map((i) => ({
      uid: i.uid,
      role: user.isElderly ? 'Elderly' : ('Caretaker' as Role),
    }))[0];
  }
  async updateUser({ uid, ...newInfo }: Partial<User>): Promise<User> {
    const { uid: foundUid } = await this.findOne({ uid: uid }, { shouldExist: true });
    return await this.userRepository.save({
      uid: foundUid,
      ...newInfo,
    });
  }

  async findByPhoneNumber(phone: string): Promise<User> {
    const user = await this.findOne({ phone: phone }, { shouldExist: true });
    return user;
  }

  async findUserById(uid: number) {
    const user = await this.findOne({ uid: uid }, { shouldExist: true });
    return user;
  }

  async findCaretakerById(uid: number) {
    const caretaker = await this.findOne({ uid: uid }, { shouldBeElderly: false, shouldExist: true });
    return caretaker;
  }

  async findElderlyById(uid: number) {
    const elderly = await this.findOne({ uid: uid }, { shouldBeElderly: true, shouldExist: true });
    return elderly;
  }

  async checkRelationship(eid: number, cid: number) {
    let elderly;
    try {
      elderly = await this.findElderlyById(eid);
    } catch {
      throw new NotFoundException('Elderly Does Not Exist');
    }

    const caretakers = await this.findCaretakerByElderlyId(elderly.uid);
    if (!caretakers || !caretakers.find((caretaker) => caretaker.uid === cid))
      throw new BadRequestException("Caretaker doesn't have access to this elderly");
    return true;
  }

  async login(phone: string, password: string): Promise<{ uid: number; role: Role }> {
    let user;
    try {
      user = await this.findByPhoneNumber(phone);
    } catch {
      throw new BadRequestException("Phone number or password doesn't exist");
    }
    if (!user) throw new BadRequestException("Phone number or password doesn't exist");
    const isPasswordMatched = await this.authService.comparePassword(password, user.password);
    if (!isPasswordMatched) throw new BadRequestException("Phone number or password doesn't exist");

    const res = {
      uid: user.uid as number,
      role: user.isElderly ? 'Elderly' : ('Caretaker' as Role),
    };
    return res;
  }

  async uploadProfilePicture(uid: number, image: UploadProfileRequest): Promise<UploadProfileResponse> {
    const { uid: foundUid } = await this.findOne({ uid: uid }, { shouldExist: true });
    if (!image || !ALLOWED_PROFILE_FORMAT.includes(image.type)) {
      throw new UnsupportedMediaTypeException('Invalid image type');
    }
    const buffer = Buffer.from(image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new BadRequestException('Image too large');
    }
    const imageUrl = await this.googleStorageService.uploadImage(foundUid, buffer, BucketName.Profile);
    const { imageid } = await this.userRepository.save({
      uid: foundUid,
      imageid: imageUrl,
    });
    return { url: imageid };
  }

  async verifyPhoneNoExist(phoneNo: string): Promise<OTP> {
    const phone = await this.userRepository.findOne({ where: { phone: phoneNo } })
    if (!phone)
      throw new HttpException('This phone number does not exist', HttpStatus.NOT_FOUND);
    const OTP = this.otpService.getOtp(phoneNo)
    return OTP
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  async comparePassword(data: string, encrypted: string) {
    return await bcrypt.compare(data, encrypted);
  }

  async forgotPassword(forgotPassword: ForgotPassword): Promise<string> {
    const uid = (await this.userRepository.findOne({ where: { phone: forgotPassword.phoneNo } })).uid
    const realOldPassword = (await this.userRepository.findOne({ where: { uid: uid } })).password
    const isMatched = await this.comparePassword(forgotPassword.newPassword, realOldPassword)
    if (isMatched)
      throw new HttpException("New password entered is the old password", HttpStatus.BAD_REQUEST)
    await this.userRepository.update(uid, { password: await this.hashPassword(forgotPassword.newPassword) })
    return 'Complete'
  }
}
