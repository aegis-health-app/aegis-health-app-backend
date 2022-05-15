import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  HttpException,
  HttpStatus,
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
import { Between, LessThan, MoreThanOrEqual, Repository } from 'typeorm';
import { CreateReminderDto, UpdateReminderDto, UploadReminderImageDto } from './dto/create-reminder.dto';
import { ReminderDto } from './dto/reminder.dto';
import {
  GetReminder,
  ImportanceLevel,
  ListReminderEachDate,
  ListReminderEachFutureDate,
  ListUnfinishedReminder,
  ModifiedFutureReminder,
  ModifiedReminder,
} from './reminder.interface';

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
  async findOneAndPopulateUser(rid: number, shouldJoinCaretaker = true) {
    const query = this.reminderRepository
      .createQueryBuilder('reminder')
      .where('reminder.rid = :rid', { rid: rid })
      .leftJoinAndSelect('reminder.user', 'user');
    if (shouldJoinCaretaker) query.leftJoinAndSelect('user.takenCareBy', 'caretakers', 'reminder.isRemindCaretaker=:t', { t: true });
    const reminder = await query.getOne();
    if (!reminder) throw new NotFoundException('Reminder does not exist');
    return reminder;
  }
  async create(dto: CreateReminderDto, uid: number) {
    if (dto.customRecursion && dto.recursion) throw new ConflictException('Reminder cannot have both custom and predefied recursion');
    if (moment(dto.startingDateTime).utcOffset(-7).valueOf() < Date.now()) throw new BadRequestException('Start date cannot be in the past');
    const elderly = await this.userService.findOne({ uid: dto.eid ?? uid }, { shouldBeElderly: true, relations: ['takenCareBy'] });
    if (dto.eid && !elderly.takenCareBy.find((caretaker) => caretaker.uid === uid))
      throw new MethodNotAllowedException('You do not have permission to access this elderly');
    const startingDateTime = moment(new Date(dto.startingDateTime)).set('seconds', 0);
    const payload = this.reminderRepository.create({
      startingDateTime: startingDateTime.format('YYYY-MM-DD HH:mm:ss'),
      title: dto.title,
      note: dto.note,
      isRemindCaretaker: dto.isRemindCaretaker,
      importanceLevel: dto.importanceLevel ?? ImportanceLevel.LOW,
      user: elderly,
      isDone: false,
      recurrings: [],
    });
    const reminder = await this.reminderRepository.save(payload);
    if (dto.image) {
      reminder.imageid = await this.uploadReminderImage(reminder.rid, dto.image);
      await this.reminderRepository.save(reminder);
    }
    reminder.recurrings = await this.recurringRepository.save(
      this.getRecursionForDb(reminder.rid, startingDateTime.toDate(), dto.recursion, dto.customRecursion)
    );
    const schedule: Schedule = {
      customRecursion: dto.customRecursion,
      recursion: dto.recursion,
      startDate: startingDateTime.add(-7, 'h').toDate(),
      name: reminder.rid.toString(),
    };
    await this.scheduleReminder({ ...reminder, startingDateTime: new Date(reminder.startingDateTime) }, schedule);
    return reminder;
  }

  async update(dto: UpdateReminderDto, uid: number, image?: ImageDto) {
    if (dto.customRecursion && dto.recursion) throw new ConflictException('Reminder cannot have both custom and predefied recursion');
    if (dto.startingDateTime && moment(dto.startingDateTime).utcOffset(-7).valueOf() < Date.now())
      throw new BadRequestException('Start date cannot be in the past');
    const startingDateTime = dto.startingDateTime ? moment(new Date(dto.startingDateTime)).set('seconds', 0) : undefined;
    const reminder = await this.reminderRepository.findOne({ rid: dto.rid }, { relations: ['user'] });
    if (!reminder) throw new NotFoundException('Reminder does not exist');
    if (uid !== reminder.user.uid && !(await this.userService.checkRelationship(reminder.user.uid, uid)))
      throw new ForbiddenException('You do not have permission to access this reminder');
    let newRecursion = undefined;
    if (dto.recursion || dto.customRecursion) {
      newRecursion = await this.recurringRepository.save(
        this.getRecursionForDb(
          reminder.rid,
          startingDateTime ? startingDateTime.toDate() : reminder.startingDateTime,
          dto.recursion,
          dto.customRecursion
        )
      );
    }
    const updatedReminder = await this.reminderRepository.save({
      ...dto,
      imageid: image ? await this.uploadReminderImage(reminder.rid, image) : undefined,
      recurrings: newRecursion,
      startingDateTime: startingDateTime ? startingDateTime.format('YYYY-MM-DD HH:mm:ss') : undefined,
    });
    if (!dto) return updatedReminder; //if only image needs to be updated
    if (dto.recursion) {
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.RECURRING);
    }
    if (dto.importanceLevel) {
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.INTERVAL_TIMEOUT);
      this.schedulerService.deleteJob(updatedReminder.rid.toString(), JobType.INTERVAL);
    }
    const schedule: Schedule = {
      customRecursion: dto.customRecursion,
      recursion: dto.recursion,
      startDate: startingDateTime ? startingDateTime.add(-7, 'h').toDate() : reminder.startingDateTime,
      name: updatedReminder.rid.toString(),
    };
    await this.scheduleReminder(updatedReminder, schedule);
    return updatedReminder;
  }

  async scheduleReminder(reminder: Reminder, schedule: Schedule) {
    let joinedReminder = reminder;
    if (!reminder.user || (reminder.isRemindCaretaker && !reminder.user.takenCareBy))
      joinedReminder = await this.findOneAndPopulateUser(reminder.rid, reminder.isRemindCaretaker);
    const elderly = joinedReminder.user;
    const jobCallback = () => {
      const message: NotificationMessage = {
        data: {
          title: joinedReminder.title,
          note: joinedReminder.note,
          isDone: joinedReminder.isDone.toString(),
          startingDateTime: joinedReminder.startingDateTime.toDateString(),
          user: `${elderly.fname} ${elderly.lname}`,
          rid: joinedReminder.rid.toString(),
          eid: elderly.uid.toString(),
        },
        notification: {
          title: joinedReminder.title,
          body: joinedReminder.note,
        },
      };
      if (joinedReminder.isRemindCaretaker) {
        const receivers = joinedReminder.user.takenCareBy.map((caretaker) => caretaker.uid);
        receivers.push(joinedReminder.user.uid);
        this.notificationService.notifyMany(receivers, message);
      } else this.notificationService.notifyOne(joinedReminder.user.uid, message);
    };
    if (schedule.customRecursion || schedule.recursion) this.schedulerService.scheduleRecurringJob(schedule, jobCallback);
    else {
      this.schedulerService.scheduleJob(joinedReminder.rid.toString(), schedule.startDate, jobCallback);
      if (joinedReminder.importanceLevel === ImportanceLevel.MEDIUM) {
        this.schedulerService.scheduleInterval(joinedReminder.rid.toString(), schedule.startDate, { maxIteration: 3, interval: 600000 }, jobCallback);
      } else if (joinedReminder.importanceLevel === ImportanceLevel.HIGH) {
        this.schedulerService.scheduleInterval(joinedReminder.rid.toString(), schedule.startDate, { interval: 600000 }, jobCallback);
      }
    }
  }

  private async uploadReminderImage(rid: number, image: ImageDto) {
    if (!image || !ALLOWED_PROFILE_FORMAT.includes(image.type) || !image.base64) {
      throw new UnsupportedMediaTypeException('Invalid image type');
    }
    const buffer = Buffer.from(image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new BadRequestException('Image too large');
    }
    const imgUrl = await this.googleCloudStorage.uploadImage(rid, buffer, BucketName.Reminder);
    return imgUrl;
  }
  private getScheduleFromRecurring(rid: number, recurrings: Recurring[], startDate: Date): Schedule {
    const days = [];
    const dates = [];
    let recursion;
    recurrings.forEach((recurring) => {
      if (recurring.recurringDateOfMonth) dates.push(recurring.recurringDateOfMonth);
      if (recurring.recurringDay) days.push(recurring.recurringDay);
    });
    const customRecursion: Recursion = {
      dates,
      days,
      period: dates.length ? RecursionPeriod.MONTH : RecursionPeriod.WEEK,
    };
    if (customRecursion.dates.length === 1) recursion = RecurringInterval.EVERY_MONTH;
    else if (customRecursion.days.length === 1) recursion = RecurringInterval.EVERY_WEEK;
    else if (customRecursion.days.length === 7) recursion = RecurringInterval.EVERY_DAY;
    return {
      startDate: startDate,
      name: rid.toString(),
      customRecursion: !recursion ? customRecursion : undefined,
      recursion: recursion,
    };
  }
  private getRecursionForDb(rid: number, startDate: Date, recursion?: RecurringInterval, customRecursion?: Recursion): Partial<Recurring>[] {
    const recurrings = [];
    if (customRecursion?.days && customRecursion?.period === RecursionPeriod.WEEK) {
      return customRecursion.days.map((day) => ({ recurringDateOfMonth: 0, recurringDay: day, reminder: { rid } as Reminder }));
    } else if (customRecursion?.dates && customRecursion?.period === RecursionPeriod.MONTH) {
      return customRecursion.dates.map((date) => ({ recurringDateOfMonth: date, recurringDay: 0, reminder: { rid } as Reminder }));
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
            recurringDay: startDate.getDay() || 7,
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

  async deleteReminder(rid: number, uid: number): Promise<string> {
    const reminder = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.rid = :rid', { rid: rid })
      .getOne();

    if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND);
    await this.reminderRepository.delete(reminder);
    this.clearReminderJobs(reminder.rid);
    return 'Complete';
  }

  async getReminder(rid: number, uid: number): Promise<ReminderDto> {
    const reminder = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.rid = :rid', { rid: rid })
      .leftJoinAndSelect('reminder.recurrings', 'recurring')
      .getOne();

    if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND);
    const schedule = this.getScheduleFromRecurring(reminder.rid, reminder.recurrings, reminder.startingDateTime);
    return { ...reminder, ...schedule, importanceLevel: reminder.importanceLevel as ImportanceLevel, uid };
  }

  async getFinishedReminder(currentDate: Date, uid: number): Promise<ListReminderEachDate[]> {
    currentDate.setDate(currentDate.getDate() - 7);
    currentDate.setUTCHours(0, 0, 0);

    const reminders: Reminder[] = await this.reminderRepository
      .createQueryBuilder('finishedReminder')
      .leftJoinAndSelect('finishedReminder.user', 'user')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('finishedReminder.isDone = :isDone', { isDone: true })
      .andWhere('finishedReminder.startingDateTime >= :currentDate', {
        currentDate: moment(currentDate).set('seconds', 0).format('YYYY-MM-DD HH:mm:ss').toString(),
      })
      .orderBy('startingDateTime', 'DESC')
      .getMany();

    currentDate.setDate(currentDate.getDate() + 8);
    const listReminderGroupByDate: ListReminderEachDate[] = [];
    for (let i = 0; i < 9; i++) {
      const listReminderEachDate: ModifiedReminder[] = [];
      for (const reminder of reminders) {
        if (reminder.startingDateTime.getDate() === currentDate.getDate()) {
          listReminderEachDate.push({
            rid: reminder.rid,
            title: reminder.title,
            note: reminder.note,
            isRemindCaretaker: reminder.isRemindCaretaker,
            importanceLevel: reminder.importanceLevel,
            imageid: reminder.imageid,
            hour: reminder.startingDateTime.getHours(),
            minute: reminder.startingDateTime.getMinutes(),
          });
          reminders.splice(reminders.indexOf(reminder), 1);
        }
      }
      listReminderGroupByDate.push({
        date: new Date(currentDate),
        reminder: listReminderEachDate,
      });
      currentDate.setDate(currentDate.getDate() - 1);
    }
    return listReminderGroupByDate;
  }

  async getUnfinishedReminder(currentDate: Date, uid: number): Promise<ListUnfinishedReminder> {
    // Get Overdue part

    let overdueReminders: Reminder[] = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .leftJoinAndSelect('reminder.recurrings', 'recurring')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.isDone = :isDone', { isDone: false })
      .andWhere('reminder.startingDateTime < :currentDate', {
        currentDate: moment(currentDate).set('seconds', 0).format('YYYY-MM-DD HH:mm:ss').toString(),
      })
      .orderBy('startingDateTime', 'ASC')
      .getMany();

    overdueReminders = overdueReminders.filter((reminder) => reminder.recurrings.length === 0);

    const dateList = [];
    for (const overdueReminder of overdueReminders) {
      const date = new Date(overdueReminder.startingDateTime);
      date.setUTCHours(0, 0, 0);
      if (!dateList.find((temp) => temp.getTime() === date.getTime())) {
        dateList.push(date);
      }
    }
    const overdue: ListReminderEachDate[] = [];
    for (const date of dateList) {
      const listReminderEachDate: ModifiedReminder[] = [];
      for (const overdueReminder of overdueReminders) {
        const overdueDate = new Date(overdueReminder.startingDateTime);
        overdueDate.setUTCHours(0, 0, 0);
        if (overdueDate.getTime() === date.getTime()) {
          listReminderEachDate.push({
            rid: overdueReminder.rid,
            title: overdueReminder.title,
            note: overdueReminder.note,
            isRemindCaretaker: overdueReminder.isRemindCaretaker,
            importanceLevel: overdueReminder.importanceLevel,
            imageid: overdueReminder.imageid,
            hour: overdueReminder.startingDateTime.getHours(),
            minute: overdueReminder.startingDateTime.getMinutes(),
          });
          overdueReminders.splice(overdueReminders.indexOf(overdueReminder), 1);
        }
      }
      overdue.push({
        date: date,
        reminder: listReminderEachDate,
      });
    }

    // Get Future part
    const nextWeekDate = new Date(currentDate);
    nextWeekDate.setDate(nextWeekDate.getDate() + 8);
    nextWeekDate.setUTCHours(0, 0, 0);
    currentDate.setMinutes(currentDate.getMinutes() - 1);

    const futureReminders: Reminder[] = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .leftJoinAndSelect('reminder.recurrings', 'recurring')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.isDone = :isDone', { isDone: false })
      .andWhere('reminder.startingDateTime between :currentDate and :nextWeekDate', {
        currentDate: moment(currentDate).set('seconds', 0).format('YYYY-MM-DD HH:mm:ss').toString(),
        nextWeekDate: moment(nextWeekDate).set('seconds', 0).format('YYYY-MM-DD HH:mm:ss').toString(),
      })
      .orderBy('startingDateTime', 'ASC')
      .getMany();

    currentDate.setMinutes(currentDate.getMinutes() + 1);
    const tempDate = new Date(currentDate);
    tempDate.setUTCHours(0, 0, 0);
    const future: ListReminderEachFutureDate[] = [];
    for (let i = 0; i < 8; i++) {
      const futureDate = new Date(tempDate);
      const listReminderEachDate: ModifiedFutureReminder[] = [];
      for (const futureReminder of futureReminders) {
        if (futureReminder.startingDateTime.getDate() === futureDate.getDate()) {
          listReminderEachDate.push({
            rid: futureReminder.rid,
            title: futureReminder.title,
            note: futureReminder.note,
            isRemindCaretaker: futureReminder.isRemindCaretaker,
            importanceLevel: futureReminder.importanceLevel,
            imageid: futureReminder.imageid,
            hour: futureReminder.startingDateTime.getHours(),
            minute: futureReminder.startingDateTime.getMinutes(),
            isRecurring: !(futureReminder.recurrings.length === 0),
          });
          futureReminders.splice(futureReminders.indexOf(futureReminder), 1);
        }
      }

      // Recurring Part
      const recurringDay = futureDate.getDay() || 7;
      const recurringDateOfMonth = futureDate.getDate();
      const recurringReminders: Recurring[] = await this.recurringRepository.find({
        where: [{ recurringDateOfMonth: recurringDateOfMonth , uid: uid}, { recurringDay: recurringDay , uid:uid}],
        relations: ['reminder'],
      });
      if (i === 0) {
        for (const recurringReminder of recurringReminders) {
          const reminderDate = recurringReminder.reminder.startingDateTime;
          if (
            reminderDate.getTime() < currentDate.getTime() &&
            reminderDate.getHours() * 60 + reminderDate.getMinutes() >= currentDate.getHours() * 60 + currentDate.getMinutes()
          ) {
            listReminderEachDate.push({
              rid: recurringReminder.reminder.rid,
              title: recurringReminder.reminder.title,
              note: recurringReminder.reminder.note,
              isRemindCaretaker: recurringReminder.reminder.isRemindCaretaker,
              importanceLevel: recurringReminder.reminder.importanceLevel,
              imageid: recurringReminder.reminder.imageid,
              hour: recurringReminder.reminder.startingDateTime.getHours(),
              minute: recurringReminder.reminder.startingDateTime.getMinutes(),
              isRecurring: true,
            });
          }
        }
      } else {
        for (const recurringReminder of recurringReminders) {
          if (recurringReminder.reminder.startingDateTime.getTime() < futureDate.getTime()) {
            listReminderEachDate.push({
              rid: recurringReminder.reminder.rid,
              title: recurringReminder.reminder.title,
              note: recurringReminder.reminder.note,
              isRemindCaretaker: recurringReminder.reminder.isRemindCaretaker,
              importanceLevel: recurringReminder.reminder.importanceLevel,
              imageid: recurringReminder.reminder.imageid,
              hour: recurringReminder.reminder.startingDateTime.getHours(),
              minute: recurringReminder.reminder.startingDateTime.getMinutes(),
              isRecurring: true,
            });
          }
        }
      }
      future.push({
        date: futureDate,
        reminder: listReminderEachDate.sort(function (a, b) {
          return a.hour * 60 + a.minute - b.hour * 60 - b.minute;
        }),
      });
      tempDate.setDate(tempDate.getDate() + 1);
    }
    return {
      overdue: overdue,
      future: future,
    };
  }

  async markAsNotComplete(rid: number, uid: number): Promise<string> {
    const reminder = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.rid = :rid', { rid: rid })
      .getOne();

    if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND);
    if (!reminder.isDone) throw new HttpException('This reminder is not yet completed', HttpStatus.CONFLICT);
    reminder.isDone = false;
    if (moment(reminder.startingDateTime).utcOffset(0).milliseconds() > Date.now()) {
      await this.scheduleReminder(reminder, {
        startDate: reminder.startingDateTime,
        name: reminder.rid.toString(),
      });
    }
    await this.reminderRepository.save(reminder);
    return 'Complete';
  }

  async markAsComplete(rid: number, currentDate: Date, uid: number): Promise<string> {
    const reminder = await this.reminderRepository
      .createQueryBuilder('reminder')
      .leftJoinAndSelect('reminder.user', 'user')
      .leftJoinAndSelect('reminder.recurrings', 'recurring')
      .where('user.uid = :uid', { uid: uid })
      .andWhere('reminder.rid = :rid', { rid: rid })
      .getOne();

    if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND);
    if (reminder.isDone) throw new HttpException('This reminder is already completed', HttpStatus.CONFLICT);
    if (moment(reminder.startingDateTime).add(-7, 'h').toDate().getTime() - currentDate.getTime() > 1800000)
      throw new HttpException('Can not mark reminder in advance over 30 minutes', HttpStatus.CONFLICT);
    if (reminder.recurrings.length !== 0) throw new HttpException('Can not mark reminder that have recurring', HttpStatus.CONFLICT);

    reminder.isDone = true;
    await this.reminderRepository.save(reminder);
    this.clearReminderJobs(reminder.rid);
    return 'Complete';
  }
  private clearReminderJobs(rid: number): void {
    this.schedulerService.deleteJob(rid.toString(), JobType.INTERVAL);
    this.schedulerService.deleteJob(rid.toString(), JobType.INTERVAL_TIMEOUT);
    this.schedulerService.deleteJob(rid.toString(), JobType.TIMEOUT);
    this.schedulerService.deleteJob(rid.toString(), JobType.RECURRING);
  }
  //for frontend (FILM) to test notification
  //TODO: remove this before production
  async testNotification(rid: number) {
    const reminder = await this.findOneAndPopulateUser(rid);
    const message: NotificationMessage = {
      data: {
        title: reminder.title,
        note: reminder.note,
        isDone: reminder.isDone.toString(),
        startingDateTime: reminder.startingDateTime.toString(),
        user: `${reminder.user.fname} ${reminder.user.lname}`,
        rid: reminder.rid.toString(),
        eid: reminder.user.uid.toString(),
      },
      notification: {
        title: reminder.title,
        body: reminder.note,
      },
    };
    if (reminder.isRemindCaretaker) {
      const receivers = reminder.user.takenCareBy.map((caretaker) => caretaker.uid);
      receivers.push(reminder.user.uid);
      return await this.notificationService.notifyMany(receivers, message);
    } else return await this.notificationService.notifyOne(reminder.user.uid, message);
  }
}
