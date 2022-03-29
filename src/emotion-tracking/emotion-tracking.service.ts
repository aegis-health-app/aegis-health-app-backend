import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { EmotionRecord } from './emotion-tracking.interface';
import { User } from 'src/entities/user.entity';
import moment from 'moment';

@Injectable()
export class EmotionTrackingService {
    constructor(
        @InjectRepository(EmotionalRecord)
        private emotionRecordRepository: Repository<EmotionalRecord>,
        @InjectRepository(User)
        private userRepository: Repository<User>

    ) {}

    async createEmotionalRecord(uid: number, emotionLevel: string): Promise<EmotionRecord>{
        //timestamp+uid must be unique, throw exception or just simply replace?
        const emotionalRecord = new EmotionalRecord();
        emotionalRecord.date = moment().format('YYYY-MM-DD');
        emotionalRecord.emotionalLevel = emotionLevel;
        const user = await this.userRepository.findOne({uid});
        emotionalRecord.user = user;
        await this.emotionRecordRepository.save(emotionalRecord);  
        return {
            uid: emotionalRecord.user.uid,
            emotionLevel: emotionalRecord.emotionalLevel,
            date: emotionalRecord.date
        }
    }
}