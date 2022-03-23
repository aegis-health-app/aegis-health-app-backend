import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ElderlyCode, ElderlyProfile, CaretakerInfo } from './interfaces/link.interface'
import Hashids from 'hashids';

@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) {}

    async getElderly(elderlyCode: string): Promise<ElderlyProfile>{
        const hashids = new Hashids('aegis', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
        const eid = hashids.decode(elderlyCode)[0];
        const elderly = await this.userRepository.findOne({
            where: {
                uid: eid,
                isElderly: true
            }
        })
        if(elderly){
            const elderlyProfile = {
                uid: elderly['uid'],
                imageid: elderly['imageid'],
                fname: elderly['fname'],
                lname: elderly['lname'],
                dname: elderly['dname']
            }
            return elderlyProfile;
        }
        throw new HttpException('Invalid elderlyCode', HttpStatus.BAD_REQUEST);
    }

    async getCaretaker(uid: number): Promise<CaretakerInfo>{
        const caretaker = await this.userRepository.findOne({uid, isElderly: false});
        if(caretaker){
            const caretakerInfo = {
                uid: caretaker['uid'],
                phone: caretaker['phone'],
                imageid: caretaker['imageid'],
                fname: caretaker['fname'],
                lname: caretaker['lname'],
                dname: caretaker['dname'],
                bday: caretaker['bday'],
                gender: caretaker['gender']
            }
            return caretakerInfo;
        }
        throw new HttpException('Invalid uid', HttpStatus.BAD_REQUEST);
    }

    async getElderlyCode(uid: number): Promise<ElderlyCode> { //figure out response format
        const user = await this.userRepository.findOne({uid});
        if (user) {
            if(user['isElderly']){
                const hashids = new Hashids('aegis', 6, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ1234567890');
                const code = hashids.encode(uid);
                return {code};
            } else{
                throw new HttpException('Invalid elderly id', HttpStatus.BAD_REQUEST);
            }
        } else {
            throw new HttpException('Invalid elderly id', HttpStatus.BAD_REQUEST);
        }
    }

}
