import { BadRequestException, HttpException, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Recurring } from 'src/entities/recurring.entity';
import { Reminder } from 'src/entities/reminder.entity';
import { User } from 'src/entities/user.entity';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { NotificationMessage } from 'src/notification/interface/notification.interface';
import { NotificationService } from 'src/notification/notification.service';
import { RecurringInterval, Recursion, RecursionPeriod, Schedule } from 'src/scheduler/interface/scheduler.interface';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { UserService } from 'src/user/user.service';
import { ALLOWED_PROFILE_FORMAT } from 'src/utils/global.constant';
import { ImageDto } from 'src/utils/global.dto';
import { Repository } from 'typeorm';
import { domainToASCII } from 'url';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderController } from './reminder.controller';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder) private reminderRepository: Repository<Reminder>,
    private notificationService: NotificationService,
    private schedulerService: SchedulerService,
    private googleCloudStorage: GoogleCloudStorage,
    private userService: UserService
  ) {}
  async create(dto: CreateReminderDto, uid: number) {
    if (dto.recursion && dto.customRecursion) throw new BadRequestException('Reminder cannot have both predefined and custom recursion');
    let recursion: Partial<Recurring>[] | undefined = undefined;
    if (dto.recursion) {
      recursion = this.getRecursionFromEnum(dto.recursion, dto.startingDateTime);
    } else if (dto.customRecursion) {
      recursion = this.getRecursion(dto.customRecursion);
    }
    const user = await this.userService.findOne(
      { uid: dto.eid ?? uid },
      { relations: dto.isRemindCaretaker ? ['takenCareBy'] : undefined, shouldBeElderly: true }
    );
    const payload = {
      startingDateTime: moment(dto.startingDateTime).set('seconds', 0).format('YYYY-MM-DD hh:mm:ss'),
      title: dto.title,
      note: dto.note,
      isRemindCaretaker: dto.isRemindCaretaker,
      importanceLevel: dto.importanceLevel,
      imageid: null,
      user: user,
      isDone: false,
      recurrings: recursion,
    };
    const reminder = this.reminderRepository.create(payload);
    const rid = (await this.reminderRepository.insert(reminder)).identifiers[0].rid;
    const imgUrl = await this.uploadReminderImage(dto.image, rid);
    reminder.rid = rid;
    reminder.imageid = imgUrl;
    const savedReminder = await this.reminderRepository.save(reminder);
    const jobCallback = () => {
      const message: NotificationMessage = {
        data: {
          title: savedReminder.title,
          note: savedReminder.note,
          isDone: savedReminder.isDone,
          startingDateTime: savedReminder.startingDateTime,
          user: savedReminder.user.uid,
        },
        notification: {
          title: savedReminder.title,
          body: savedReminder.note,
        },
      };
      if (savedReminder.isRemindCaretaker) {
        const receivers = savedReminder.user.takenCareBy.map((caretaker) => caretaker.uid);
        receivers.push(savedReminder.user.uid);
        this.notificationService.notifyMany(receivers, message);
      } else this.notificationService.notifyOne(savedReminder.user.uid, message);
    };
    const schedule: Schedule = {
      customRecursion: dto.customRecursion,
      recursion: dto.recursion,
      startDate: dto.startingDateTime,
      name: savedReminder.rid.toString(),
    };
    if (schedule.customRecursion || schedule.recursion) this.schedulerService.scheduleRecurringJob(schedule, jobCallback);
    else this.schedulerService.scheduleJob(savedReminder.rid.toString(), dto.startingDateTime, jobCallback);
    return savedReminder;
  }
  async uploadReminderImage(image: ImageDto, rid: number) {
    if (!image || !ALLOWED_PROFILE_FORMAT.includes(image.type)) {
      throw new UnsupportedMediaTypeException('Invalid image type');
    }
    const buffer = Buffer.from(image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new BadRequestException('Image too large');
    }
    return await this.googleCloudStorage.uploadImage(rid, buffer, BucketName.Reminder);
  }
  private getRecursion(custom: Recursion): Partial<Recurring>[] {
    if (custom.days && custom.period === RecursionPeriod.WEEK) {
      return custom.days.map((day) => ({ recurringDateOfMonth: 0, recurringDay: day }));
    } else if (custom.date && custom.period === RecursionPeriod.MONTH) {
      return [{ recurringDateOfMonth: custom.date }];
    }
    throw new BadRequestException('Invalid recurring interval');
  }
  private getRecursionFromEnum(recurringInterval: RecurringInterval, startDate: Date): Partial<Recurring>[] {
    const recurrings: Partial<Recurring>[] = [];
    switch (recurringInterval) {
      case RecurringInterval.EVERY_DAY:
        for (let i = 1; i < 8; i++) {
          recurrings.push({
            recurringDateOfMonth: 0,
            recurringDay: i,
          });
        }
        break;
      case RecurringInterval.EVERY_WEEK:
        recurrings.push({
          recurringDateOfMonth: 0,
          recurringDay: startDate.getDay() ?? 7,
        });
        break;
      case RecurringInterval.EVERY_MONTH:
        recurrings.push({
          recurringDateOfMonth: startDate.getDate(),
          recurringDay: 0,
        });
        break;
      default:
        throw new BadRequestException('Invalid recurring inveral');
    }
    return recurrings;
  }
}
