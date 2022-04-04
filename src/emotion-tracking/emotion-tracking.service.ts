import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { EmotionHistory, Emotion } from './emotion-tracking.interface';
import { EmotionTrackingStatusDto } from './dto/emotion-tracking.dto';
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
            emotionalRecord.emotionalLevel = Emotion[emotionLevel];
            const user = await this.userRepository.findOne({uid});
            emotionalRecord.user = user;
            await this.emotionRecordRepository.save(emotionalRecord);  
            return {message: "Emotion record successfully created"};
        } 
        throw new HttpException('Emotion record of this elderly has already been made today', HttpStatus.BAD_REQUEST);
    }

    async getEmotionalRecord(caretakerId: number, elderlyId: number, limit: number, offset:number=0): Promise<EmotionHistory>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        let emotionalRecord;
        let numRecords;
        emotionalRecord = await this.emotionRecordRepository
            .createQueryBuilder("emotionRecord")
            .where("emotionRecord.uid = :uid", {uid: elderlyId})
            .orderBy("emotionRecord.date", "DESC")
            .getMany();
        numRecords = emotionalRecord.length;
    
        //check if the limit is specified. default: return all
        if(limit){
            emotionalRecord = await this.emotionRecordRepository
                .createQueryBuilder("emotionRecord")
                .where("emotionRecord.uid = :uid", {uid: elderlyId})
                .orderBy("emotionRecord.date", "DESC")
                .limit(limit)
                .offset(offset)
                .getMany();
        }
        emotionalRecord.forEach(record => {
            record.emotionalLevel = Emotion[record.emotionalLevel]
        })
        const emotionalHistory = {
            count: numRecords,
            records: emotionalRecord
        }
        return emotionalHistory;
    }

    async getEmotionTrackingStatus(caretakerId: number, elderlyId: number): Promise<EmotionTrackingStatusDto>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];
        let emotionTrackingStatus = new EmotionTrackingStatusDto();
        if(moduleFive){
            emotionTrackingStatus['isEnabled'] = true;
        } else{
            emotionTrackingStatus['isEnabled'] = false;
        }
        return emotionTrackingStatus;
    }

    async addEmotionalTrackingModuleToElderly(caretakerId: number, elderlyId: number): Promise<{statusCode: number, message: string}>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];  //5 is the moduleid of Emotion Tracking module
        if(moduleFive){
            throw new HttpException("Emotion tracking is already enabled", HttpStatus.CONFLICT);
        }
        const module = await this.moduleRepository.findOne({moduleid: 5});
        elderly.modules.push(module);
        await this.userRepository.save(elderly);
        return {statusCode: 201, message: 'Emotion tracking is successfully enabled'}
    }

    async removeEmotionalTrackingModuleFromElderly(caretakerId: number, elderlyId: number): Promise<{statusCode: number, message: string}>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        const elderly = await this.userRepository.findOne({uid: elderlyId},{
            relations: ["modules"]
        })
        const moduleFive = elderly.modules.filter(module=> module.moduleid === 5)[0];  //5 is the moduleid of Emotion Tracking module
        if(! moduleFive){
            throw new HttpException("Emotion tracking is already disabled", HttpStatus.CONFLICT);
        }
        elderly.modules =  elderly.modules.filter(module=> module.moduleid !== 5);
        await this.userRepository.save(elderly);
        return {statusCode: 200, message: 'Emotion tracking is successfully disabled'}
    }

    // async isValidCaretaker(caretakerId, elderlyId): Promise<boolean>{
    //     const caretakers = await this.userService.findCaretakerByElderlyId(elderlyId);
    //     const caretaker = caretakers.filter(caretaker => caretaker.uid === +caretakerId)[0];
    //     if(! caretaker){
    //         throw new HttpException('Invalid uid, this elderly is not taken care by this caretaker', HttpStatus.BAD_REQUEST);
    //     }
    //     return true;
    // }
}