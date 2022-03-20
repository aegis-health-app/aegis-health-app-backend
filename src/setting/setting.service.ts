import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { ChangePasswordDto } from './dto/setting.dto';
import * as bcrypt from 'bcrypt'

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
}

