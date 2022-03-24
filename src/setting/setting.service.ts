import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { ChangePassword, ChangePhoneNo } from './setting.interface';
import * as bcrypt from 'bcrypt'
import { OtpService } from '../otp/otp.service'

@Injectable()
export class SettingService {

  constructor(
    private otpService: OtpService,
    @InjectRepository(User)
    private settingRepository: Repository<User>,
  ) { }

  async findOne(uid: number): Promise<User> {
    const user = await this.settingRepository.findOne(
      {
        where:
          { uid: uid }
      })
    if (!user)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    return user;
  }

  async hashPassword(password: string): Promise<string> {
    return await bcrypt.hash(password, Number(process.env.HASH_SALT));
  }

  async comparePassword(data: string, encrypted: string) {
    return await bcrypt.compare(data, encrypted);
  }

  async changeUserPassword(passwordInterface: ChangePassword, uid: number): Promise<boolean> {
    const realOldPassword = (await this.findOne(uid)).password
    const oldPassword = passwordInterface.oldPassword
    const isMatched = await this.comparePassword(oldPassword, realOldPassword)
    if (!isMatched)
      throw new HttpException("Old password entered is incorrect", HttpStatus.CONFLICT)
    if (passwordInterface.oldPassword === passwordInterface.newPassword)
      throw new HttpException("New password is the old password", HttpStatus.BAD_REQUEST)
    this.settingRepository.update(uid, { password: await this.hashPassword(passwordInterface.newPassword) })
    return true;
  }

  async changePhoneNumber(phoneInterface: ChangePhoneNo, uid: number, token: string): Promise<boolean> {
    const oldPhoneNumber = (await this.findOne(uid)).phone
    const newPhoneNumber = phoneInterface.newPhone
    if (oldPhoneNumber === newPhoneNumber)
      throw new HttpException("Old phone number is the new phone number", HttpStatus.BAD_REQUEST)
    const otpVerified = this.otpService.verifyOtp(token, phoneInterface.enteredPin)
    if (!otpVerified)
      throw new HttpException("PIN entered is incorrect", HttpStatus.UNAUTHORIZED)
    this.settingRepository.update(uid, { phone: newPhoneNumber })
    return true;
  }
}