import { Controller, Get, Req, Res, Query} from '@nestjs/common';
import { LinkService } from './link.service';

@Controller('link')
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @Get('/elderlycode')
    async getElderlyCode(@Query('uid') uid:number){
        // -> get uid from jwt instead
        return this.linkService.getElderlyCode(uid);
    }

    @Get('/elderly')
    async getElderly(@Query('uid') uid:number){
        return this.linkService.getElderly(uid);
    }

    @Get('/caretaker')
    async getCaretaker(@Query('uid') uid:number){
        return this.linkService.getCaretaker(uid);
    }

}

