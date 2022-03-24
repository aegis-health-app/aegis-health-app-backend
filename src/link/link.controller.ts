import { Controller, Get, Req, Res, Param, Query, UsePipes, ValidationPipe, UseGuards} from '@nestjs/common';
import { LinkService } from './link.service';
import { ElderlyCodeDto, ElderlyProfileDto, CaretakerInfoDto } from './dto/link.dto';
import { ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';
// import { ElderlyGuard, CaretakerGuard } from "src/auth/jwt.guard"

@ApiTags('link')
@Controller('link')
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @Get('/elderlycode/:uid')
    // @ApiBearerAuth()
    @ApiOkResponse({ type: ElderlyCodeDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    @UsePipes(new ValidationPipe({ whitelist: true }))
    // @UseGuards(ElderlyGuard)
    async getElderlyCode(@Param('uid') uid:number){
    // async getElderlyCode(@Req() req){
        // const uid = req.user.userId;
        return this.linkService.getElderlyCode(uid);
    }

    @Get('/elderly/:elderlycode')
    // @ApiBearerAuth()
    @ApiOkResponse({ type: ElderlyProfileDto })
    @ApiBadRequestResponse({ description: 'Invalid elderlycode'})
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    // @UseGuards(CaretakerGuard)
    async getElderly(@Param('elderlycode') elderlyCode:string){
        return this.linkService.getElderly(elderlyCode);
    }

    @Get('/caretaker/:uid')
    // @ApiBearerAuth()
    @ApiOkResponse({ type: CaretakerInfoDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    @UsePipes(new ValidationPipe({ whitelist: true }))
    // @UseGuards(ElderlyGuard)
    // async getCaretaker(@Req() req, @Param('uid') uid: number){
    async getCaretaker(@Param('uid') uid:number, @Query('eid') elderlyId:number){
        // const elderlyId = req.user.userId;
        const caretakerId = uid;
        return this.linkService.getCaretaker(elderlyId, caretakerId);
    }

}

