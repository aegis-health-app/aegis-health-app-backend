import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from 'src/entities/module.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { ElderlyHome } from './interface/elderlyHome.interface';

@Injectable()
export class ElderlyHomeService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
    ) { }

    async findOne(uid: number): Promise<User> {
        return await this.userRepository.findOne({ uid: uid });
    }

    async getElderlyProfile(uid: number): Promise<ElderlyHome> {
        const user = await this.findOne(uid)
        if(!user){
            throw new HttpException("This user doesn't exist", HttpStatus.BAD_REQUEST)
        }
        const selectedModuleList = await this.userRepository.findOne({ uid: uid }, {
            relations: ["Selected"]
        })
        let dname = ""
        if (user.dname != null) {
            dname = user.dname
        } else {
            dname = user.fname
        }

        return {
            dname: dname,
            imageid: user.blood_type,
            listModuleid: selectedModuleList.modules.map(function (i) {
                return i.moduleid;
            })
        }
    }
