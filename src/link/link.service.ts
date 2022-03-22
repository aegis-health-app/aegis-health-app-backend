import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ElderlyCode, UserInfo } from './link.interface'
import Hashids from 'hashids';

@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) {}

    async getElderlyCode(uid: number): Promise<ElderlyCode> { //figure out response format
        const user = await this.userRepository.findOne({uid});
        console.log(user);
        if (user) {
            if(user['isElderly']){
                const hashids = new Hashids('aegis', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
                const code = hashids.encode(uid);
                return {code};
            } else{
                throw new HttpException('invalid elderly id', HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException('invalid elderly id', HttpStatus.BAD_REQUEST);
        }
    }

    async getElderly(uid: number): Promise<UserInfo>{
        const elderly = await this.userRepository.findOne({uid, isElderly: true});
        if(elderly){
            delete elderly.password;
            return elderly;
        }
        throw new HttpException('invalid uid', HttpStatus.BAD_REQUEST);
    }

    async getCaretaker(uid: number): Promise<UserInfo>{
        const caretaker = await this.userRepository.findOne({uid, isElderly: false});
        if(caretaker){
            delete caretaker.password;
            return caretaker;
        }
        throw new HttpException('invalid uid', HttpStatus.BAD_REQUEST);
    }
}
