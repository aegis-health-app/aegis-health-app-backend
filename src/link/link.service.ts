import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';
import { ElderlyCode, ElderlyProfile, CaretakerInfo } from './interfaces/link.interface'
import { UserService } from 'src/user/user.service';
import { hashids } from './link.utils';

@Injectable()
export class LinkService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private userService: UserService
    ) {}

    async getElderly(elderlyCode: string): Promise<ElderlyProfile>{
        const eid = hashids.decode(elderlyCode)[0];
        const elderly = await this.userRepository.findOne({
            where: {
                uid: eid,isElderly: true
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

    async getCaretaker(elderlyId: number, caretakerId: number): Promise<CaretakerInfo>{
        const caretakers = await this.userService.findCaretakerByElderlyId(elderlyId);
        const caretaker = caretakers.filter(caretaker => caretaker.uid === +caretakerId)[0];
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
        throw new HttpException('Invalid uid, this elderly is not taken care by this caretaker', HttpStatus.BAD_REQUEST);
    }


    async getElderlyCode(uid: number): Promise<ElderlyCode> { 
        console.log(uid);
        const user = await this.userRepository.findOne({uid});
        if (user){
            const code = hashids.encode(uid);
            return {code};
        }
        throw new HttpException('Invalid elderly id', HttpStatus.BAD_REQUEST);
    }

}
