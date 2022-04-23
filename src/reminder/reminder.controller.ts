import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UserGuard } from 'src/auth/jwt.guard';
import { ApiBearerAuth, ApiBody, ApiTags } from '@nestjs/swagger';
@ApiTags('reminder')
@Controller('reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiBody({ type: CreateReminderDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  create(@Body() createReminderDto: CreateReminderDto, @Req() req) {
    return this.reminderService.create(createReminderDto, req.user.uid);
  }
}
