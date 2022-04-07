import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { EmotionHistory, Emotion } from './emotion-tracking.interface';
import { EmotionTrackingStatusDto } from './dto/emotion-tracking.dto';
import { Module } from 'src/entities/module.entity';
import moment from 'moment';
import {UserService} from '../user/user.service'

@Injectable()
export class EmotionTrackingService {
    constructor(
        @InjectRepository(EmotionalRecord)
        private emotionRecordRepository: Repository<EmotionalRecord>,
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
            const user = await this.userService.findOne({uid});
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

    async getEmotionTrackingStatus(reqId: number, elderlyId: number): Promise<EmotionTrackingStatusDto>{
        const user = await this.userService.findUserById(reqId);
        if(user.isElderly && (reqId !== +elderlyId)){
            throw new HttpException("'Invalid uid, this user has no access to this elderly info'", HttpStatus.BAD_REQUEST);
        } else if (!user.isElderly){
            await this.userService.checkRelationship(elderlyId, reqId);
        }
        const elderly = await this.userService.findOne({uid: elderlyId}, {relations: ['modules']});
        const moduleFive = elderly.modules.find(module=> module.moduleid === 5); //5 is the moduleid of Emotion Tracking module
        let emotionTrackingStatus = new EmotionTrackingStatusDto();
        emotionTrackingStatus.isEnabled =  !!moduleFive;
        return emotionTrackingStatus;
    }

    async addEmotionalTrackingModuleToElderly(caretakerId: number, elderlyId: number): Promise<{message: string}>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        const elderly = await this.userService.findOne({uid: elderlyId}, {relations: ['modules']});
        const moduleFive = elderly.modules.find(module=> module.moduleid === 5);  
        if(moduleFive){
            throw new HttpException("Emotion tracking is already enabled", HttpStatus.CONFLICT);
        }
        const module = await this.moduleRepository.findOne({moduleid: 5});
        elderly.modules.push(module);
        await this.userService.updateUser(elderly);
        return {message: 'Emotion tracking is successfully enabled'}
    }

    async removeEmotionalTrackingModuleFromElderly(caretakerId: number, elderlyId: number): Promise<{message: string}>{
        await this.userService.checkRelationship(elderlyId, caretakerId);
        const elderly = await this.userService.findOne({uid: elderlyId}, {relations: ['modules']});
        const moduleFive = elderly.modules.find(module=> module.moduleid === 5);  
        if(! moduleFive){
            throw new HttpException("Emotion tracking is already disabled", HttpStatus.CONFLICT);
        }
        elderly.modules =  elderly.modules.filter(module=> module.moduleid !== 5);
        await this.userService.updateUser(elderly);
        return {message: 'Emotion tracking is successfully disabled'}
    }
}