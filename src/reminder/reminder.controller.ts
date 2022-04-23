import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto, UpdateReminderDto } from './dto/create-reminder.dto';
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
  @Put()
  @UseGuards()
  @ApiBearerAuth()
  @ApiBody({ type: UpdateReminderDto })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  update(@Body() updateReminderDto: UpdateReminderDto) {
    return this.reminderService.update(updateReminderDto.rid, updateReminderDto);
  }
}
