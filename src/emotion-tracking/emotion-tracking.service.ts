import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { EmotionRecord } from './emotion-tracking.interface';
import { User } from 'src/entities/user.entity';
import { Module } from 'src/entities/module.entity';
import moment from 'moment';
import {UserService} from '../user/user.service'

@Injectable()
export class EmotionTrackingService {
    constructor(
        @InjectRepository(EmotionalRecord)
        private emotionRecordRepository: Repository<EmotionalRecord>,
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Module)
        private moduleRepository: Repository<Module>,
        private userService: UserService

    ){}

    async createEmotionalRecord(uid: number, emotionLevel: string): Promise<{message: string}>{
        //check if a record for this day is already made by this user
        const currentDate = moment().format('YYYY-MM-DD');
        const existingRecord = await this.emotionRecordRepository
            .createQueryBuilder("emotionalRecord")
            .leftJoinAndSelect("emotionalRecord.user", "user")
            .where("user.uid = :uid", {uid: uid})
            .andWhere("emotionalRecord.date = :date", {date: currentDate})
            .getOne();

        if (! existingRecord){
            const emotionalRecord = new EmotionalRecord();
            emotionalRecord.date = currentDate;
            emotionalRecord.emotionalLevel = emotionLevel;
            const user = await this.userRepository.findOne({uid});
            emotionalRecord.user = user;
            await this.emotionRecordRepository.save(emotionalRecord);  
            return {message: "Emotion record created"};
        } 
        throw new HttpException('Emotion record of this elderly has already been made today', HttpStatus.BAD_REQUEST);
    }

    async getEmotionalRecord(caretakerId: number, elderlyId: number, limit: number, offset:number=0){
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

    async getEmotionTrackingStatus(caretakerId: number, elderlyId: number): Promise<boolean>{
        await this.isValidCaretaker(caretakerId, elderlyId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];
        if(moduleFive){
            return true;
        }
        return false;
    }

    async addEmotionalTrackingModuleToElderly(caretakerId: number, elderlyId: number): Promise<{message: string}>{
        await this.isValidCaretaker(caretakerId, elderlyId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];  //5 is the moduleid of Emotion Tracking module
        if(moduleFive){
            throw new HttpException("Emotion tracking is already on", HttpStatus.CONFLICT);
        }
        const module = await this.moduleRepository.findOne({moduleid: 5});
        elderly.modules.push(module);
        await this.userRepository.save(elderly);
        return {message: 'Emotion tracking is successfully turned on'}
    }

    async removeEmotionalTrackingModuleFromElderly(caretakerId: number, elderlyId: number): Promise<{message: string}>{
        await this.isValidCaretaker(caretakerId, elderlyId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];  //5 is the moduleid of Emotion Tracking module
        if(! moduleFive){
            throw new HttpException("Emotion tracking is already off", HttpStatus.CONFLICT);
        }
        elderly.modules =  elderly.modules.filter(module=> module.moduleid !== 5);
        await this.userRepository.save(elderly);
        return {message: 'Emotion tracking is successfully turned off'}
    }

    async isValidCaretaker(caretakerId, elderlyId): Promise<boolean>{
        const caretakers = await this.userService.findCaretakerByElderlyId(elderlyId);
        const caretaker = caretakers.filter(caretaker => caretaker.uid === +caretakerId)[0];
        if(! caretaker){
            throw new HttpException('Invalid uid, this elderly is not taken care by this caretaker', HttpStatus.BAD_REQUEST);
        }
        return true;
    }
}