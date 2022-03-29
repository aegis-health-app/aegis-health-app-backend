import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { User } from 'src/entities/user.entity';
import moment from 'moment';
import {UserService} from '../user/user.service'

@Injectable()
export class EmotionTrackingService {
    constructor(
        @InjectRepository(EmotionalRecord)
        private emotionRecordRepository: Repository<EmotionalRecord>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        private userService: UserService

    ) {}

    async createEmotionalRecord(uid: number, emotionLevel: string): Promise<{message: string}>{
        //timestamp+uid must be unique, throw exception or just simply replace?
        const emotionalRecord = new EmotionalRecord();
        emotionalRecord.date = moment().format('YYYY-MM-DD');
        emotionalRecord.emotionalLevel = emotionLevel;
        const user = await this.userRepository.findOne({uid});
        emotionalRecord.user = user;
        await this.emotionRecordRepository.save(emotionalRecord);  
        return {message: "Emotion record created"};
        
    }

    async getEmotionalRecord(caretakerId: number, elderlyId: number, limit: number, offset:number=0): Promise<EmotionalRecord[]>{
        //check if this caretaker is this elderly's caretaker
        const elderlyList = await this.userService.findElderlyByCaretakerId(caretakerId);
        const elderly = elderlyList.filter(elderly => elderly.uid === +elderlyId)[0];
        if(elderly){
            //check if the limit is specified. default: return all
            if(limit){
                const emotionalRecord = await this.emotionRecordRepository
                    .createQueryBuilder("emotionRecord")
                    .where("emotionRecord.uid = :uid", {uid: elderlyId})
                    .orderBy("emotionRecord.date", "DESC")
                    .limit(limit)
                    .offset(offset)
                    .getMany();
                return emotionalRecord;
            } else {
                const emotionalRecord = await this.emotionRecordRepository
                    .createQueryBuilder("emotionRecord")
                    .where("emotionRecord.uid = :uid", {uid: elderlyId})
                    .orderBy("emotionRecord.date", "DESC")
                    .getMany();
                return emotionalRecord
            }
        }
        throw new HttpException('Invalid uid, this elderly is not taken care by this caretaker', HttpStatus.BAD_REQUEST);



    }
    
}