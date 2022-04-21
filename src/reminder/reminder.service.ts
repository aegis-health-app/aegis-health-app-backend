import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Reminder } from 'src/entities/reminder.entity';
import { Repository } from 'typeorm';
import { AddReminder } from './reminder.interface';

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

    async getReminder(rid: number): Promise<AddReminder>{
        const reminder = await this.reminderRepository.findOne({where: {rid: rid}})
        if (!reminder) throw new HttpException('Reminder not found', HttpStatus.NOT_FOUND)
        
        return reminder
    }
}
