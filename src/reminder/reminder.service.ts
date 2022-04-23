import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder } from 'src/entities/reminder.entity';
import { Recurring } from 'src/entities/recurring.entity';
import { Between, LessThan, LessThanOrEqual, MoreThanOrEqual, Repository } from 'typeorm';
import { ModifiedReminder, GetReminder, ListReminderEachDate, ListUnfinishedReminder } from './reminder.interface';
import { Contains } from 'class-validator';

@Injectable()
export class ReminderService {
    constructor(
        @InjectRepository(Reminder)
        private reminderRepository: Repository<Reminder>,
        @InjectRepository(Recurring)
        private recurringRepository: Repository<Recurring>
    ) { }

    async deleteReminder(rid: number): Promise<string> {
        const reminder = await this.reminderRepository.findOne({ where: { rid: rid } })
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)

        await this.reminderRepository.delete(reminder);
        return 'Complete'
    }

    async getReminder(rid: number): Promise<GetReminder> {
        const reminder = await this.reminderRepository.findOne({ where: { rid: rid } })
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)

        return reminder
    }

    async getFinishedReminder(currentDate: Date, uid: number): Promise<ListReminderEachDate[]> {
        currentDate.setDate(currentDate.getDate() - 7)
        currentDate.setHours(0, 0, 0)
        const reminders: Reminder[] = await this.reminderRepository.find({
            where: {
                uid: uid,
                isDone: true,
                startingDate: MoreThanOrEqual(currentDate)
            },
            order: {
                startingDate: "DESC"
            }
        })

        currentDate.setDate(currentDate.getDate() + 8)
        const listReminderGroupByDate: ListReminderEachDate[] = []
        for (let i = 0; i < 9; i++) {
            const listReminderEachDate: ModifiedReminder[] = []
            for (const reminder of reminders) {
                if (reminder.startingDate.getDate() === currentDate.getDate()) {
                    listReminderEachDate.push({
                        rid: reminder.rid,
                        title: reminder.title,
                        note: reminder.note,
                        isRemindCaretaker: reminder.isRemindCaretaker,
                        importanceLevel: reminder.importanceLevel,
                        imageid: reminder.imageid,
                        hour: reminder.startingDate.getHours(),
                        minute: reminder.startingDate.getMinutes()
                    })
                    reminders.splice(reminders.indexOf(reminder), 1) //don't know if this gonna increase the speed or decrease
                }
            }
            listReminderGroupByDate.push({
                date: currentDate,
                reminder: listReminderEachDate
            })
            currentDate.setDate(currentDate.getDate() - 1)
        }
        return listReminderGroupByDate
    }

    async getUnfinishedReminder(currentDate: Date, uid: number): Promise<ListUnfinishedReminder> {
        // Get Overdue part
        const overdueReminders: Reminder[] = await this.reminderRepository.find({
            where: {
                uid: uid,
                isDone: false,
                startingDate: LessThan(currentDate),
                recurrings: [] // not sure is this gonna work
            },
            order: {
                startingDate: "ASC"
            }
        })
        const dateList = []
        for (const overdueReminder of overdueReminders) {
            const date = new Date(overdueReminder.startingDate)
            date.setHours(0, 0, 0)
            if (!dateList.includes(date)) {
                dateList.push(date)
            }
        }
        const overdue: ListReminderEachDate[] = []
        for (const date of dateList) {
            const listReminderEachDate: ModifiedReminder[] = []
            for (const overdueReminder of overdueReminders) {
                const overdueDate = new Date(overdueReminder.startingDate)
                overdueDate.setHours(0, 0, 0)
                if (overdueDate === date) {
                    listReminderEachDate.push({
                        rid: overdueReminder.rid,
                        title: overdueReminder.title,
                        note: overdueReminder.note,
                        isRemindCaretaker: overdueReminder.isRemindCaretaker,
                        importanceLevel: overdueReminder.importanceLevel,
                        imageid: overdueReminder.imageid,
                        hour: overdueReminder.startingDate.getHours(),
                        minute: overdueReminder.startingDate.getMinutes()
                    })
                    overdueReminders.splice(overdueReminders.indexOf(overdueReminder), 1)
                }
            }
            overdue.push({
                date: date,
                reminder: listReminderEachDate
            })
        }

        // Get Future part
        const nextWeekDate = new Date(currentDate)
        nextWeekDate.setDate(nextWeekDate.getDate() + 8)
        nextWeekDate.setHours(0, 0, 0)
        currentDate.setMinutes(currentDate.getMinutes() - 1)
        const futureReminders: Reminder[] = await this.reminderRepository.find({
            where: {
                uid: uid,
                isDone: false,
                startingDate: Between(currentDate, nextWeekDate)
            },
            order: {
                startingDate: "ASC"
            }
        })
        currentDate.setMinutes(currentDate.getMinutes() + 1)
        const tempDate = new Date(currentDate)
        tempDate.setHours(0, 0, 0)
        const future: ListReminderEachDate[] = []
        for (let i = 0; i < 8; i++) {
            const listReminderEachDate: ModifiedReminder[] = []
            for (const futureReminder of futureReminders) {
                if (futureReminder.startingDate.getDate() === tempDate.getDate()) {
                    listReminderEachDate.push({
                        rid: futureReminder.rid,
                        title: futureReminder.title,
                        note: futureReminder.note,
                        isRemindCaretaker: futureReminder.isRemindCaretaker,
                        importanceLevel: futureReminder.importanceLevel,
                        imageid: futureReminder.imageid,
                        hour: futureReminder.startingDate.getHours(),
                        minute: futureReminder.startingDate.getMinutes()
                    })
                    futureReminders.splice(futureReminders.indexOf(futureReminder), 1)
                }
            }

            // Recurring Part
            const recurringDay = tempDate.getDay() || 7
            const recurringDateOfMonth = tempDate.getDate()
            const recurringReminders: Recurring[] = await this.recurringRepository.find({
                where: [
                    { recurringDateOfMonth: recurringDateOfMonth },
                    { recurringDay: recurringDay },
                ]
            })
            if (i === 0) {
                for (const recurringReminder of recurringReminders) {
                    const reminderDate = recurringReminder.reminder.startingDate
                    if ((reminderDate.getTime() < currentDate.getTime()) &&
                        ((reminderDate.getHours() * 60 + reminderDate.getMinutes()) >= (currentDate.getHours() * 60 + currentDate.getMinutes()))) {
                        listReminderEachDate.push({
                            rid: recurringReminder.reminder.rid,
                            title: recurringReminder.reminder.title,
                            note: recurringReminder.reminder.note,
                            isRemindCaretaker: recurringReminder.reminder.isRemindCaretaker,
                            importanceLevel: recurringReminder.reminder.importanceLevel,
                            imageid: recurringReminder.reminder.imageid,
                            hour: recurringReminder.reminder.startingDate.getHours(),
                            minute: recurringReminder.reminder.startingDate.getMinutes()
                        })
                    }
                }
            } else {
                for (const recurringReminder of recurringReminders) {
                    if (recurringReminder.reminder.startingDate.getTime() < tempDate.getTime()) {
                        listReminderEachDate.push({
                            rid: recurringReminder.reminder.rid,
                            title: recurringReminder.reminder.title,
                            note: recurringReminder.reminder.note,
                            isRemindCaretaker: recurringReminder.reminder.isRemindCaretaker,
                            importanceLevel: recurringReminder.reminder.importanceLevel,
                            imageid: recurringReminder.reminder.imageid,
                            hour: recurringReminder.reminder.startingDate.getHours(),
                            minute: recurringReminder.reminder.startingDate.getMinutes()
                        })
                    }
                }
            }
            future.push({
                date: tempDate,
                reminder: listReminderEachDate.sort(function (a, b) {
                    return a.hour * 60 + a.minute - b.hour * 60 - b.minute
                })
            })
            tempDate.setDate(tempDate.getDate() + 1)
        }
        return {
            overdue: overdue,
            future: future
        }
    }

    async markAsNotComplete(rid: number): Promise<string>{
        const reminder = await this.reminderRepository.findOne({ where: { rid: rid } })
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)
        if (!reminder.isDone) throw new HttpException('This reminder is not yet completed', HttpStatus.CONFLICT)
        reminder.isDone = false
        
        await this.reminderRepository.save(reminder);
        return 'Complete'
    }
}