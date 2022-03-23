import { Controller, Get, Req, Res, Param} from '@nestjs/common';
import { LinkService } from './link.service';
import { ElderlyCodeDto, ElderlyProfileDto, CaretakerInfoDto } from './dto/link.dto';
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

    
    @Get('/elderly/:elderlycode')
    @ApiOkResponse({ type: ElderlyProfileDto })
    @ApiBadRequestResponse({ description: 'Invalid elderlycode'})
    async getElderly(@Param('elderlycode') elderlyCode:string){
        return this.linkService.getElderly(elderlyCode);
    }

    @Get('/caretaker/:uid')
    @ApiOkResponse({ type: CaretakerInfoDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    async getCaretaker(@Param('uid') uid:number){
        return this.linkService.getCaretaker(uid);
    }

}

