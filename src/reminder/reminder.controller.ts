import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req, UsePipes, ValidationPipe, Put } from '@nestjs/common';
import { ReminderService } from './reminder.service';
import { CreateReminderDto, SimpleStatusResponse, UpdateReminderDto, UploadReminderImageDto } from './dto/create-reminder.dto';
import { UserGuard } from 'src/auth/jwt.guard';
import {
  ApiBadRequestResponse,
  ApiBearerAuth,
  ApiBody,
  ApiConflictResponse,
  ApiMethodNotAllowedResponse,
  ApiNotFoundResponse,
  ApiResponse,
  ApiTags,
  ApiUnsupportedMediaTypeResponse,
} from '@nestjs/swagger';
@ApiTags('reminder')
@Controller('reminder')
export class ReminderController {
  constructor(private readonly reminderService: ReminderService) {}

  @Post()
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid Recurring Interval | Start date cannot be in the past' })
  @ApiMethodNotAllowedResponse({ description: 'You do not have permission to access this elderly' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Image too large | Invalid Image type' })
  @ApiConflictResponse({ description: 'Reminder cannot have both custom and predefined recursion' })
  @ApiBody({ type: CreateReminderDto })
  @ApiResponse({ type: SimpleStatusResponse })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async create(@Body() createReminderDto: CreateReminderDto, @Req() req) {
    return { status: (await this.reminderService.create(createReminderDto, req.user.uid)) ? 'success' : 'fail' };
  }
  @Put()
  @UseGuards(UserGuard)
  @ApiBearerAuth()
  @ApiBadRequestResponse({ description: 'Invalid Recurring Interval | Start date cannot be in the past' })
  @ApiMethodNotAllowedResponse({ description: 'You do not have permission to access this elderly' })
  @ApiUnsupportedMediaTypeResponse({ description: 'Image too large | Invalid Image type' })
  @ApiConflictResponse({ description: 'Reminder cannot have both custom and predefined recursion' })
  @ApiNotFoundResponse({ description: 'Reminder does not exist' })
  @ApiBody({ type: UpdateReminderDto })
  @ApiResponse({ type: SimpleStatusResponse })
  @UsePipes(new ValidationPipe({ whitelist: true }))
  async update(@Body() updateReminderDto: UpdateReminderDto, @Req() req) {
    return { status: (await this.reminderService.update(updateReminderDto, req.user.uid)) ? 'success' : 'fail' };
  }
}
