import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Module } from 'src/entities/module.entity';
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity'
import { CaretakerHome, ElderlyHome, ElderlyInfo } from './interface/home.interface';

@Injectable()
export class HomeService {
    constructor(
        @InjectRepository(User)
        private userRepository: Repository<User>,
        @InjectRepository(Module)
        private moduleRepository : Repository<Module>,
    ) { }
    
    showName(user: User): string {
        if (user.dname != null) {
            return user.dname
        } else {
            return user.fname
        }
    }

    async getElderlyHome(uid: number): Promise<ElderlyHome> {
        const user = await this.userRepository.findOne({ uid: uid });
        if(!user){
            throw new HttpException("This user doesn't exist", HttpStatus.BAD_REQUEST)
        }
        const selectedModuleList = await this.userRepository.findOne({ uid: uid }, {
            relations: ["Selected"]
        })

        return {
            dname: this.showName(user),
            imageid: user.imageid,
            listModuleid: selectedModuleList.modules.map(function (i) {
                return i.moduleid;
            })
        }
    }

    async getModuleList(): Promise<Module[]>{
        return await this.moduleRepository.find()
    }

    async deleteModule(uid: number, moduleid: number): Promise<number[]>{
        let selectedModuleList = await this.userRepository.findOne({ uid: uid }, {
            relations: ["Selected"]
        })

        if(!selectedModuleList){
            throw new HttpException("This user doesn't exist", HttpStatus.BAD_REQUEST)
        }
        
        selectedModuleList.modules = selectedModuleList.modules.filter(function(i) {
            return i.moduleid !== moduleid
        })

        await this.userRepository.save(selectedModuleList)

        return selectedModuleList.modules.map(function (i) {
            return i.moduleid;
        })
    }

    async addModule(uid: number, moduleid: number): Promise<number[]>{
        let selectedModuleList = await this.userRepository.findOne({ uid: uid }, {
            relations: ["Selected"]
        })

        if( selectedModuleList.modules.find(function(i) {i.moduleid === moduleid}) ) {
            throw new HttpException("This module is already selected", HttpStatus.BAD_REQUEST)
        }
        
        const selectedModule = (await this.moduleRepository.findOne(moduleid))

        if( !selectedModule ){
            throw new HttpException("This module is not exist", HttpStatus.BAD_REQUEST)
        }

        selectedModuleList.modules.push(selectedModule)

        await this.userRepository.save(selectedModuleList)

        return selectedModuleList.modules.map(function (i) {
            return i.moduleid;
        })
    }

    async getCaretakerHome(uid: number): Promise<CaretakerHome> {
        const caretaker = await this.userRepository.findOne({ uid: uid }, {
            relations: ["takingCareOf"]
        })

        if(!caretaker){
            throw new HttpException("This user doesn't exist", HttpStatus.BAD_REQUEST)
        }

        const temShowName = this.showName
        const elderlyList =  caretaker.takingCareOf.map(function (elderly) {
            return {
                uid: elderly.uid,
                dname: temShowName(elderly),
                imageid: elderly.imageid
            }
        })

        return {
            dname: this.showName(caretaker),
            imageid: caretaker.imageid,
            listElderly: elderlyList
        }
    }

    async getElderlyInfo(cid: number, eid: number): Promise<ElderlyInfo>{
        const elderly = await this.userRepository.findOne({ uid: eid }, {
            relations: ["takenCareBy", "Selected"]
        })

        const caretaker = elderly.takenCareBy.filter(function (caretaker) {
            return caretaker.uid === cid;
        })

        if( !caretaker){
            throw new HttpException("This caretaker doesn't take care this elderly", HttpStatus.BAD_REQUEST)
        }

        return {
            imageid: elderly.imageid,
            fname: elderly.fname,
            lname: elderly.lname,
            dname: elderly.dname,
            gender: elderly.gender,
            bday: elderly.bday,
            healthCondition: elderly.healthCondition,
            bloodType: elderly.bloodType,
            personalMedication: elderly.personalMedication,
            allergy: elderly.allergy,
            vaccine: elderly.vaccine,
            phone: elderly.phone,
            listModuleid: elderly.modules.map(function (i) {
                return i.moduleid;
            })
        }
    }
}