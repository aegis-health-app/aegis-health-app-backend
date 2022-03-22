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
    @Delete("/module")
    async deleteSelectedModule(@Req() req, @Body() moduleid: number): Promise<number[]> {
        const selectedModule = await this.homeService.deleteModule(req.user.uid, moduleid)
        return selectedModule
    }

    @Post('/module')
    async addSelectedModule(@Req() req, @Body() moduleid: number): Promise<number[]> {
        const selectedModule = await this.homeService.addModule(req.user.uid, moduleid)
        return selectedModule
    }

    @Get('/caretakerHome')
    async getCaretakerHome(@Req() req): Promise<CaretakerHomeDTO> {
        const elderly = await this.homeService.getCaretakerHome(req.user.uid)
        return elderly
    }

    @Get('/elderlyInfo/:uid')
    async getElderlyInfo(@Req() req, @Param("uid") eid: number): Promise<ElderlyInfoDTO> {
        return await this.homeService.getElderlyInfo(req.user.id, eid)
    }
}