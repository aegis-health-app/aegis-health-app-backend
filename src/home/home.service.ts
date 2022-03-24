import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { type } from 'os';
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
        const user = await this.userRepository.findOne({ uid: uid }, {
            relations: ["modules"]
        })

        if(!user){
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        return {
            dname: this.showName(user),
            imageid: user.imageid,
            listModuleid: user.modules.map(function (module) {
                return module.moduleid;
            })
        }
    }

    async getModuleList(): Promise<Module[]>{
        return await this.moduleRepository.find()
    }

    async deleteModule(uid: number, moduleid: number): Promise<number[]>{
        const user = await this.userRepository.findOne({ uid: uid }, {
            relations: ["modules"]
        })

        if(!user){
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }

        if( !(await this.moduleRepository.findOne(moduleid)) ){
            throw new HttpException("This module doesn't exist", HttpStatus.BAD_REQUEST)
        }
        
        const deleteModule = user.modules.find(function(module) { return module.moduleid === moduleid })
    
        if( !deleteModule ){
            throw new HttpException("This module is not in this elderly's module list", HttpStatus.CONFLICT)
        }

        user.modules = user.modules.filter(function(module) {
            return module.moduleid !== moduleid
        })

        await this.userRepository.save(user)

        return user.modules.map(function (module) {
            return module.moduleid;
        })
    }

    async addModule(uid: number, moduleid: number): Promise<number[]>{
        const user = await this.userRepository.findOne({ uid: uid }, {
            relations: ["modules"]
        })

        if(!user){
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
        }       

        if( user.modules.find(function(module) { return module.moduleid === moduleid}) ) {
            throw new HttpException("This module is already selected", HttpStatus.CONFLICT)
        }
        
        const selectedModule = (await this.moduleRepository.findOne(moduleid))

        if( !selectedModule ){
            throw new HttpException("This module doesn't not exist", HttpStatus.BAD_REQUEST)
        }

        user.modules.push(selectedModule)

        await this.userRepository.save(user)

        return user.modules.map(function (module) {
            return module.moduleid;
        })
    }

    async getCaretakerHome(uid: number): Promise<CaretakerHome> {
        const caretaker = await this.userRepository.findOne({ uid: uid }, {
            relations: ["takingCareOf"]
        })

        if(!caretaker){
            throw new HttpException("User not found", HttpStatus.NOT_FOUND)
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
            relations: ["takenCareBy", "modules"]
        })

        if( !elderly){
            throw new HttpException("This elderly doesn't exist", HttpStatus.NOT_FOUND)
        }
        
        const caretaker = elderly.takenCareBy.find(function (caretaker) { return caretaker.uid === cid;})
        if( !caretaker){
            throw new HttpException("This caretaker doesn't take care this elderly", HttpStatus.FORBIDDEN)
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
            listModuleid: elderly.modules.map(function (module) {
                return module.moduleid;
            })
        }
    }
}