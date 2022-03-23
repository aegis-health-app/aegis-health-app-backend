import { Body, Controller, Delete, Get, Param, Post, Req } from '@nestjs/common'
import { Module } from '../entities/module.entity'
import { CaretakerHomeDTO, ElderlyHomeDTO, ElderlyInfoDTO } from './dto/home.dto'
import { HomeService } from './home.service'
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiConflictResponse, ApiCreatedResponse, ApiForbiddenResponse, ApiNotFoundResponse, ApiOkResponse, ApiTags, ApiUnauthorizedResponse } from "@nestjs/swagger"

@ApiTags("home")
@Controller('home')
export class HomeController {
    constructor(private readonly homeService: HomeService) { }

    //@ApiBearerAuth()
    @ApiNotFoundResponse({ description: "User not found" })
    @ApiUnauthorizedResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ type: ElderlyHomeDTO })
    //@UseGuards()
    @Get("/elderlyHome")
    async getElderlyHome(@Req() req): Promise<ElderlyHomeDTO> {
        return await this.homeService.getElderlyHome(req.user.uid)
    }

    //@ApiBearerAuth()
    @ApiOkResponse({ type: [Module] })
    @ApiUnauthorizedResponse({ description: "Must login to use this endpoints" })
    //@UseGuards()
    @Get("/moduleList")
    async getModuleList(): Promise<Module[]> {
        return await this.homeService.getModuleList()
    }

    //@ApiBearerAuth()
    @ApiNotFoundResponse({ description: "User not found" })
    @ApiConflictResponse({ description: "This module is not in this elderly's module list" })
    @ApiUnauthorizedResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ type: [Number] })
    //@UseGuards()
    @Delete("/module")
    async deleteSelectedModule(@Req() req, @Body() moduleid: number): Promise<number[]> {
        return await this.homeService.deleteModule(req.user.uid, moduleid)
    }

    //@ApiBearerAuth()
    @ApiBadRequestResponse({ description: "This module is not exist" })
    @ApiConflictResponse({ description: "This module is already selected" })
    @ApiUnauthorizedResponse({ description: "Must be elderly to use this endpoints" })
    @ApiOkResponse({ type: [Number] })
    //@UseGuards()    
    @Post('/module')
    async addSelectedModule(@Req() req, @Body() moduleid: number): Promise<number[]> {
        const selectedModule = await this.homeService.addModule(req.user.uid, moduleid)
        return selectedModule
    }

    //@ApiBearerAuth()
    @ApiNotFoundResponse({ description: "User not found" })
    @ApiUnauthorizedResponse({ description: "Must be caretaker to use this endpoints" })
    @ApiOkResponse({ type: CaretakerHomeDTO })
    //@UseGuards()    
    @Get('/caretakerHome')
    async getCaretakerHome(@Req() req): Promise<CaretakerHomeDTO> {
        const elderly = await this.homeService.getCaretakerHome(req.user.uid)
        return elderly
    }

    //@ApiBearerAuth()
    @ApiNotFoundResponse({ description: "This elderly doesn't exist" })
    @ApiForbiddenResponse({ description: "This caretaker doesn't take care this elderly" })
    @ApiUnauthorizedResponse({ description: "Must be caretaker to use this endpoints" })
    @ApiOkResponse({ type: ElderlyInfoDTO })
    //@UseGuards()      
    @Get('/elderlyInfo/:uid')
    async getElderlyInfo(@Req() req, @Param("uid") eid: number): Promise<ElderlyInfoDTO> {
        return await this.homeService.getElderlyInfo(req.user.id, eid)
    }
}