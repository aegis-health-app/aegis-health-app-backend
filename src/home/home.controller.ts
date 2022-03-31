import { Body, Controller, Delete, Get, Param, Post, Req, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { AddModuleDTO, CaretakerHomeDTO, DeleteModuleDTO, ElderlyHomeDTO, ElderlyInfoDTO, ModuleInfoDTO } from './dto/home.dto';
import { HomeService } from './home.service';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiConflictResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { CaretakerGuard, ElderlyGuard, UserGuard } from 'src/auth/jwt.guard';

@ApiBearerAuth()
@ApiTags('home')
@Controller('home')
export class HomeController {
  constructor(private readonly homeService: HomeService) {}

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ type: ElderlyHomeDTO })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Get('/elderlyHome')
  async getElderlyHome(@Req() req): Promise<ElderlyHomeDTO> {
    return await this.homeService.getElderlyHome(req.user.uid);
  }

  @ApiOkResponse({ type: [ModuleInfoDTO] })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(UserGuard)
  @Get('/allModule')
  async getAllModule(): Promise<ModuleInfoDTO[]> {
    return await this.homeService.getAllModule();
  }

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: "This module doesn't exist" })
  @ApiConflictResponse({ description: "This module is not in this elderly's module list" })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @ApiOkResponse({ type: [Number] })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(ElderlyGuard)
  @Delete('/module')
  async deleteSelectedModule(@Req() req, @Body() body: DeleteModuleDTO): Promise<number[]> {
    return await this.homeService.deleteModule(req.user.uid, body.moduleid);
  }

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBadRequestResponse({ description: "This module doesn't exist" })
  @ApiConflictResponse({ description: 'This module is already selected' })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be elderly to use this endpoints' })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @ApiOkResponse({ type: [Number] })
  @UseGuards(ElderlyGuard)
  @Post('/module')
  async addSelectedModule(@Req() req, @Body() body: AddModuleDTO): Promise<number[]> {
    const selectedModule = await this.homeService.addModule(req.user.uid, body.moduleid);
    return selectedModule;
  }

  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ type: CaretakerHomeDTO })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(CaretakerGuard)
  @Get('/caretakerHome')
  async getCaretakerHome(@Req() req): Promise<CaretakerHomeDTO> {
    const elderly = await this.homeService.getCaretakerHome(req.user.uid);
    return elderly;
  }

  @ApiNotFoundResponse({ description: "This elderly doesn't exist" })
  @ApiForbiddenResponse({ description: "This caretaker doesn't take care this elderly" })
  @ApiUnauthorizedResponse({ description: 'Must login to use this endpoints' })
  @ApiForbiddenResponse({ description: 'Must be caretaker to use this endpoints' })
  @ApiOkResponse({ type: ElderlyInfoDTO })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @UseGuards(CaretakerGuard)
  @Get('/elderlyInfo/:eid')
  async getElderlyInfo(@Req() req, @Param('eid') eid: number): Promise<ElderlyInfoDTO> {
    return await this.homeService.getElderlyInfo(req.user.uid, eid);
  }
}
