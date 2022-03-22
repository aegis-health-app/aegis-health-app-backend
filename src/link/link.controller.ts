import { Controller, Get, Req, Res, Param} from '@nestjs/common';
import { LinkService } from './link.service';
import { UserInfoDto, ElderlyCodeDto } from './dto/link.dto';
import { ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth, ApiTags } from '@nestjs/swagger';

@ApiTags('link')
@Controller('link')
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @Get('/elderlycode/:uid')
    // @ApiBearerAuth()
    @ApiOkResponse({ type: ElderlyCodeDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    async getElderlyCode(@Param('uid') uid:number){
        // -> get uid from jwt instead
        return this.linkService.getElderlyCode(uid);
    }

    
    @Get('/elderly/:uid')
    @ApiOkResponse({ type: UserInfoDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    async getElderly(@Param('uid') uid:number){
        return this.linkService.getElderly(uid);
    }

    @Get('/caretaker/:uid')
    @ApiOkResponse({ type: UserInfoDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    async getCaretaker(@Param('uid') uid:number){
        return this.linkService.getCaretaker(uid);
    }

}

