import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  MethodNotAllowedException,
  NotFoundException,
  UnsupportedMediaTypeException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Recurring } from 'src/entities/recurring.entity';
import { Reminder } from 'src/entities/reminder.entity';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { NotificationMessage } from 'src/notification/interface/notification.interface';
import { NotificationService } from 'src/notification/notification.service';
import { JobType, RecurringInterval, Recursion, RecursionPeriod, Repetition, Schedule } from 'src/scheduler/interface/scheduler.interface';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { UserService } from 'src/user/user.service';
import { ALLOWED_PROFILE_FORMAT } from 'src/utils/global.constant';
import { ImageDto } from 'src/utils/global.dto';
import { Repository } from 'typeorm';
import { CreateReminderDto, UpdateReminderDto, UploadReminderImageDto } from './dto/create-reminder.dto';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder) private reminderRepository: Repository<Reminder>,
    @InjectRepository(Recurring) private recurringRepository: Repository<Recurring>,
    private notificationService: NotificationService,
    private schedulerService: SchedulerService,
    private googleCloudStorage: GoogleCloudStorage,
    private userService: UserService
  ) {}
  async create(dto: CreateReminderDto, uid: number) {
    if (dto.customRecursion && dto.recursion) throw new ConflictException('Reminder cannot have both custom and predefied recursion');
    if (moment(dto.startingDateTime).utcOffset(0).valueOf() < Date.now()) throw new BadRequestException('Start date cannot be in the past');
    const user = await this.userService.findOne(
      { uid: dto.eid ?? uid },
      { relations: dto.isRemindCaretaker ? ['takenCareBy'] : undefined, shouldBeElderly: true }
    );
    if (dto.eid && !user.takenCareBy.find((caretaker) => caretaker.uid === uid))
      throw new MethodNotAllowedException('You do not have permission to access this elderly');
    const payload = this.reminderRepository.create({
      startingDateTime: moment(dto.startingDateTime).set('seconds', 0).format('YYYY-MM-DD hh:mm:ss'),
      title: dto.title,
      note: dto.note,
      isRemindCaretaker: dto.isRemindCaretaker,
      importanceLevel: dto.importanceLevel,
      user: user,
      isDone: false,
      recurrings: [],
    });
    const reminder = await this.reminderRepository.save(payload);
    reminder.recurrings = await this.recurringRepository.save(
      this.getRecursion(reminder.rid, dto.startingDateTime, dto.recursion, dto.customRecursion)
    );
    const schedule: Schedule = {
      customRecursion: dto.customRecursion,
      recursion: dto.recursion,
      startDate: dto.startingDateTime,
      name: reminder.rid.toString(),
    };
    this.scheduleReminder(reminder, schedule);
    return reminder;
  }

  async update(dto: UpdateReminderDto, uid: number) {
    if (dto.customRecursion && dto.recursion) throw new ConflictException('Reminder cannot have both custom and predefied recursion');
    if (moment(dto.startingDateTime).utcOffset(0).valueOf() < Date.now()) throw new BadRequestException('Start date cannot be in the past');
    const reminder = await this.reminderRepository.findOne({ rid: dto.rid }, { relations: ['user'] });
    if (!reminder) throw new NotFoundException('Reminder does not exist');
    if (uid !== reminder.user.uid && !(await this.userService.checkRelationship(reminder.user.uid, uid)))
      throw new ForbiddenException('You do not have permission to access this reminder');
    let newRecursion = undefined;
    if (dto.recursion || dto.customRecursion)
      newRecursion = this.getRecursion(
        reminder.rid,
        dto.startingDateTime ?? new Date(reminder.startingDateTime.toNumber()),
        dto.recursion,
        dto.customRecursion
      );
    const updatedReminder = await this.reminderRepository.save({
      ...dto,
      recurrings: newRecursion ?? reminder.recurrings,
      startingDateTime: dto.startingDateTime ? moment(dto.startingDateTime).set('seconds', 0).format('YYYY-MM-DD hh:mm:ss') : undefined,
    });
    if (dto.customRecursion === null || dto.recursion === null) {
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.RECURRING);
    }
    if (dto.importanceLevel) {
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.INTERVAL_TIMEOUT);
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.INTERVAL);
    }
    const schedule: Schedule = {
      customRecursion: dto.customRecursion,
      recursion: dto.recursion,
      startDate: dto.startingDateTime ?? new Date(reminder.startingDateTime.toNumber()),
      name: updatedReminder.rid.toString(),
    };
    this.scheduleReminder(updatedReminder, schedule);
    return updatedReminder;
  }

  scheduleReminder(reminder: Reminder, schedule: Schedule) {
    const jobCallback = () => {
      const message: NotificationMessage = {
        data: {
          title: reminder.title,
          note: reminder.note,
          isDone: reminder.isDone,
          startingDateTime: reminder.startingDateTime,
          user: reminder.user.uid,
        },
        notification: {
          title: reminder.title,
          body: reminder.note,
        },
      };
      if (reminder.isRemindCaretaker) {
        const receivers = reminder.user.takenCareBy.map((caretaker) => caretaker.uid);
        receivers.push(reminder.user.uid);
        this.notificationService.notifyMany(receivers, message);
      } else this.notificationService.notifyOne(reminder.user.uid, message);
    };
    if (schedule.customRecursion || schedule.recursion) this.schedulerService.scheduleRecurringJob(schedule, jobCallback);
    else {
      this.schedulerService.scheduleJob(reminder.rid.toString(), schedule.startDate, jobCallback);
      if (reminder.importanceLevel === 'Mid') {
        this.schedulerService.scheduleInterval(reminder.rid.toString(), schedule.startDate, { maxIteration: 3, interval: 600000 }, jobCallback);
      } else if (reminder.importanceLevel === 'High') {
        this.schedulerService.scheduleInterval(reminder.rid.toString(), schedule.startDate, { interval: 600000 }, jobCallback);
      }
    }
  }

  async uploadReminderImage({ rid, ...image }: UploadReminderImageDto, uid: number) {
    if (!image || !ALLOWED_PROFILE_FORMAT.includes(image.type)) {
      throw new UnsupportedMediaTypeException('Invalid image type');
    }
    const buffer = Buffer.from(image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new BadRequestException('Image too large');
    }
    const reminder = await this.reminderRepository.findOne({ rid }, { relations: ['user'] });
    if (!reminder) throw new NotFoundException('Reminder does not exist');
    if (uid !== reminder.user.uid && !(await this.userService.checkRelationship(reminder.user.uid, uid)))
      throw new ForbiddenException('You do not have permission to access this reminder');
    const imgUrl = await this.googleCloudStorage.uploadImage(rid, buffer, BucketName.Reminder);
    reminder.imageid = imgUrl;
    await this.reminderRepository.save(reminder);
    return imgUrl;
  }

  private getRecursion(rid: number, startDate: Date, recursion?: RecurringInterval, customRecursion?: Recursion): Partial<Recurring>[] {
    const recurrings = [];
    if (customRecursion?.days && customRecursion?.period === RecursionPeriod.WEEK) {
      return customRecursion.days.map((day) => ({ recurringDateOfMonth: 0, recurringDay: day }));
    } else if (customRecursion?.date && customRecursion?.period === RecursionPeriod.MONTH) {
      return [{ recurringDateOfMonth: customRecursion.date }];
    } else if (recursion) {
      switch (recursion) {
        case RecurringInterval.EVERY_DAY:
          for (let i = 1; i < 8; i++) {
            recurrings.push({
              recurringDateOfMonth: 0,
              recurringDay: i,
              reminder: { rid: rid },
            });
          }
          break;
        case RecurringInterval.EVERY_WEEK:
          recurrings.push({
            recurringDateOfMonth: 0,
            recurringDay: startDate.getDay() ?? 7,
            reminder: { rid: rid },
          });
          break;
        case RecurringInterval.EVERY_MONTH:
          recurrings.push({
            recurringDateOfMonth: startDate.getDate(),
            recurringDay: 0,
            reminder: { rid: rid },
          });
          break;
        default:
          throw new BadRequestException('Invalid recurring inveral');
      }
    }
    return recurrings;
  }
}
