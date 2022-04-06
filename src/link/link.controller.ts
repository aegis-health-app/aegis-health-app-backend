import { Controller, Get, Req, Param, UsePipes, ValidationPipe, UseGuards} from '@nestjs/common';
import { LinkService } from './link.service';
import { ElderlyCodeDto, ElderlyProfileDto, CaretakerInfoDto } from './dto/link.dto';
import { ApiOperation, ApiOkResponse, ApiBadRequestResponse, ApiBearerAuth, ApiUnauthorizedResponse, ApiForbiddenResponse, ApiTags } from '@nestjs/swagger';
import { ElderlyGuard, CaretakerGuard } from "src/auth/jwt.guard"

@ApiTags('link')
@Controller('link')
export class LinkController {
    constructor(private readonly linkService: LinkService) {}

    @Get('/elderlycode')
    @ApiOperation({description: "Get elderly code for the linking functionality"})
    @ApiBearerAuth()
    @ApiOkResponse({ type: ElderlyCodeDto })
    @ApiBadRequestResponse({ description: 'Invalid uid'})
    @ApiUnauthorizedResponse({ description: 'Login is required'})
    @ApiForbiddenResponse({description: "This endpoint is restricted for elderly"})
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @UseGuards(ElderlyGuard)
    async getElderlyCode(@Req() req){
        const uid = req.user.uid;
        return this.linkService.getElderlyCode(uid);
    }

    @Get('/elderly/:elderlycode')
    @ApiOperation({description: "Get elderly's profile"})
    @ApiBearerAuth()
    @ApiOkResponse({ type: ElderlyProfileDto })
    @ApiBadRequestResponse({ description: 'Invalid elderlycode'})
    @ApiUnauthorizedResponse({ description: 'Login is required'})
    @ApiForbiddenResponse({description: "This endpoint is restricted for caretaker"})
    @UsePipes(new ValidationPipe({ whitelist: true }))    
    @UseGuards(CaretakerGuard)
    async getElderly(@Param('elderlycode') elderlyCode:string){
        return this.linkService.getElderly(elderlyCode);
    }

    @Get('/caretaker/:uid')
    @ApiOperation({description: "Get caretaker's information"})
    @ApiBearerAuth()
    @ApiOkResponse({ type: CaretakerInfoDto })
    @ApiBadRequestResponse({ description: 'Invalid uid, this elderly is not taken care by this caretaker'})
    @ApiUnauthorizedResponse({ description: 'Login is required'})
    @ApiForbiddenResponse({description: 'This endpoint is restricted for elderly'})
    @UsePipes(new ValidationPipe({ whitelist: true }))
    @UseGuards(ElderlyGuard)
    async getCaretaker(@Req() req, @Param('uid') uid: number){
        const elderlyId = req.user.uid;
        const caretakerId = uid;
        return this.linkService.getCaretaker(elderlyId, caretakerId);
    }

}

