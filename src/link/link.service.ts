import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ElderlyCode } from './interfaces/elderlycode.interface';
import Hashids from 'hashids';

@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,

    ) {}

    async getElderlyCode(uid: number): Promise<ElderlyCode> { //figure out response format
        const user = await this.userRepository.findOne({uid});
        if (user) {
            if(user['is_elderly']){
                const hashids = new Hashids('aegis', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
                const code = hashids.encode(uid);
                return {code};
            } else{ //user is a caretaker
                throw new HttpException('invalid elderly id', HttpStatus.BAD_REQUEST);
            }
        } else { //user not existed
            throw new HttpException('invalid elderly id', HttpStatus.BAD_REQUEST);
        }
    }

    async getUser(uid: number){
        const user = await this.userRepository.findOne({uid});
        if(user){
            return user;
        }
        throw new HttpException('invalid uid', HttpStatus.BAD_REQUEST);
    }
}
