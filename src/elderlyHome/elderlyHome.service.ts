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
        @InjectRepository(Module)
        private moduleRepository : Repository<Module>,
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
