import { BadRequestException, HttpException, Injectable, UnsupportedMediaTypeException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import moment from 'moment';
import { Recurring } from 'src/entities/recurring.entity';
import { Reminder } from 'src/entities/reminder.entity';
import { User } from 'src/entities/user.entity';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { NotificationService } from 'src/notification/notification.service';
import { RecurringInterval, Recursion, RecursionPeriod } from 'src/scheduler/interface/scheduler.interface';
import { SchedulerService } from 'src/scheduler/scheduler.service';
import { ALLOWED_PROFILE_FORMAT } from 'src/utils/global.constant';
import { ImageDto } from 'src/utils/global.dto';
import { Repository } from 'typeorm';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { ReminderController } from './reminder.controller';

@Injectable()
export class ReminderService {
  constructor(
    @InjectRepository(Reminder) private reminderRepository: Repository<Reminder>,
    private notificationService: NotificationService,
    private schedulerService: SchedulerService,
    private googleCloudStorage: GoogleCloudStorage
  ) {}
  async create(dto: CreateReminderDto, uid: number) {
    //validate stuffs
    if (dto.recursion && dto.customRecursion) throw new BadRequestException('Reminder cannot have both predefined and custom recursion');
    let recursion: Partial<Recurring>[] | undefined = undefined;
    if (dto.recursion) {
      recursion = this.getRecursionFromEnum(dto.recursion, dto.startingDateTime);
    } else if (dto.customRecursion) {
      recursion = this.getRecursion(dto.customRecursion);
    }
    const imgUrl = await this.uploadReminderImage(dto.image, uid);
    const reminder = await this.reminderRepository.create({
      startingDateTime: moment(dto.startingDateTime).format('YYYY-MM-DD hh:mm:ss'),
      title: dto.title,
      note: dto.note,
      isRemindCaretaker: dto.isRemindCaretaker,
      importanceLevel: dto.importanceLevel,
      imageid: imgUrl,
      user: { uid: uid },
      isDone: false,
      recurrings: recursion,
    });
    const rid = (await this.reminderRepository.insert(reminder)).identifiers[0].rid;
    return rid;
  }
  async uploadReminderImage(image: ImageDto, uid: number) {
    if (!image || !ALLOWED_PROFILE_FORMAT.includes(image.type)) {
      throw new UnsupportedMediaTypeException('Invalid image type');
    }
    const buffer = Buffer.from(image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new BadRequestException('Image too large');
    }
    return await this.googleCloudStorage.uploadImage(uid, buffer, BucketName.Reminder);
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
        for (let i = 1; i < 32; i++) {
          recurrings.push({
            recurringDateOfMonth: i,
            recurringDay: 0,
          });
        }
        break;
      case RecurringInterval.EVERY_WEEK:
        recurrings.push({
          recurringDateOfMonth: 0,
          recurringDay: startDate.getDay(),
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
