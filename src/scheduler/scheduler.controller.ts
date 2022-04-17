import { Controller, Post, Body, UsePipes, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/auth/jwt.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { Schedule } from './interface/scheduler.interface';
@ApiTags('scheduler')
@Controller('scheduler')
export class ScheduleController {
  constructor(private readonly schedulerService: SchedulerService) {}
  @Post('/test-cron')
  @ApiBody({ type: Schedule })
  async test(@Body() body: Schedule) {
    this.schedulerService.scheduleJob(body, () => console.log('donee!!'));
    return 'ok';
  }
}
