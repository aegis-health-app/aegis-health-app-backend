import { Body, Controller, Delete, Get, Req } from '@nestjs/common';
import { Module } from '../entities/module.entity'
import { ElderlyHomeService } from './elderlyHome.service';
import { ElderlyHome } from './interface/elderlyHome.interface';

@Controller('elderly-home')
export class ElderlyHomeController {
    constructor(private readonly elderlyHomeService: ElderlyHomeService) { }

    @Get("/profile")
    async getElderlyProfile(@Req() req): Promise<ElderlyHome> {
        const elderly = await this.elderlyHomeService.getElderlyProfile(req.user.uid)
        return elderly
    }

    @Get("/moduleList")
    async getModuleList(): Promise<Module[]> {
        const moduleList = await this.elderlyHomeService.getModuleList()
        return moduleList
    }
