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

    @Get('/user')
    async getUser(@Query('uid') uid:number){
        return this.linkService.getUser(uid);
    }

}

