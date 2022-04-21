import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder } from 'src/entities/reminder.entity';
import { MoreThan, Repository } from 'typeorm';
import { GetReminder, ListFinishedReminder } from './reminder.interface';

@Injectable()
export class ReminderService {
    @InjectRepository(Reminder)
    private reminderRepository: Repository<Reminder>

    async deleteReminder(rid: number): Promise<string>{
        const reminder = await this.reminderRepository.findOne({where: {rid: rid}})
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)

        await this.reminderRepository.delete(reminder);
        return 'Complete'
    }

    async getReminder(rid: number): Promise<GetReminder>{
        const reminder = await this.reminderRepository.findOne({where: {rid: rid}})
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)
        
        return reminder
    }

    async getFinishedReminder(currentDate: Date, uid: number): Promise<ListFinishedReminder[]>{
        currentDate.setDate(currentDate.getDate() - 7)
        currentDate.setHours(0, 0, 0, 0)
        let reminders = await this.reminderRepository.find({
            where: {
                uid:uid, 
                isDone:true,
                startingDate: MoreThan(currentDate)
            },
            order:{
                startingDate: "ASC"
            }})
        let listReminderGroupByDate = []
        for (let i = 0; i < 7; i++) {
            let listReminderEachDate = []
            for (const reminder of reminders){
                if (reminder.startingDate.getDate() === currentDate.getDate()){
                    listReminderEachDate.push(reminder)
                    reminders.pop()
                }
            }
            listReminderGroupByDate.push({
                date: currentDate,
                reminder: listReminderEachDate
            })
            currentDate.setDate(currentDate.getDate() + 1)
        }
        return listReminderGroupByDate
    }
}
