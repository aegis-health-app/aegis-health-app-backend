import { Controller, Post, Body, UsePipes, ValidationPipe, Req, UseGuards } from '@nestjs/common';
import { UserGuard } from 'src/auth/jwt.guard';
import { ApiBadRequestResponse, ApiBearerAuth, ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { SchedulerService } from './scheduler.service';
import { Schedule } from './interface/scheduler.interface';
@ApiTags('scheduler')
@Controller('scheduler')
export class SchedulerController {
  constructor(private readonly schedulerService: SchedulerService) {}
  @Post('/register-device')
  @ApiBody({ type: Schedule })
  async test(@Body() body: Schedule) {
    this.schedulerService.scheduleRecurringJob(body, () => console.log('done'));
  }
}
