import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { Module } from '../entities/module.entity'
import { CaretakerHomeDTO, ElderlyHomeDTO, ElderlyInfoDTO } from './dto/home.dto'
import { HomeService } from './home.service'

@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }

    @Get("/elderlyHome")
    async getElderlyHome(@Req() req): Promise<ElderlyHomeDTO> {
        const elderly = await this.homeService.getElderlyHome(req.user.uid)
        return elderly
    }

    @Get("/moduleList")
    async getModuleList(): Promise<Module[]> {
        const moduleList = await this.homeService.getModuleList()
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