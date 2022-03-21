import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { ChangePasswordDto, ChangePhoneNoDto } from './dto/setting.dto';
import * as bcrypt from 'bcrypt'
import { AuthController } from '../auth/auth.controller.ts' 

@Injectable()
export class SettingService {

  constructor(
    @InjectRepository(User)
    private settingRepository: Repository<User>,
  ) { }

  async findOne(uid: number): Promise<User> {
    return await this.settingRepository.findOne({ uid: uid });
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT))
  }

  async changeUserPassword(passwordDto: ChangePasswordDto, uid: number): Promise<boolean> {
    const realOldPasswordHashed = (await this.findOne(uid)).password
    const newPasswordHashed = await this.hashPassword(passwordDto.newPassword)
    const oldPasswordHashed = await this.hashPassword(passwordDto.oldPassword) // user entered value
    if (realOldPasswordHashed !== oldPasswordHashed)
      throw new HttpException("Old password entered is incorrect", HttpStatus.BAD_REQUEST)
    if (realOldPasswordHashed === newPasswordHashed)
      throw new HttpException("New password is the old password", HttpStatus.BAD_REQUEST)
    this.settingRepository.update(uid, { password: newPasswordHashed })
    return true;
  }

  async changePhoneNumber(phoneDto: ChangePhoneNoDto, uid: number, token: string): Promise<boolean> {
    const oldPhoneNumber = (await this.findOne(uid)).phone
    const newPhoneNumber = phoneDto.newPhone
    if (oldPhoneNumber === newPhoneNumber)
      throw new HttpException("Old phone number is the new phone number", HttpStatus.BAD_REQUEST)
    // NEED TO CHECK FOR OTP LATER
    const otpVerified = verifyOTP(token, phoneDto.enteredPin)
    if (!otpVerified)
      throw new HttpException("PIN entered is incorrect", HttpStatus.BAD_REQUEST)
    this.settingRepository.update(uid, { phone: newPhoneNumber })
    return true;
  }
}

