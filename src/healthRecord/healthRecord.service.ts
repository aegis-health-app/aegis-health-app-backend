import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AllHealthRecords, HealthRecord } from './healthRecord.interface';

@Injectable()
export class HealthRecordService {

  constructor(
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
  ) { }

  async getHealthRecord(uid: number): Promise<AllHealthRecords> {
    if (!uid)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    const healthRecordList = await this.healthRecordRepository.find(
      {
        where:
          { uid: uid },
      }
    )
    return {
      uid: uid,
      listHealthRecords: healthRecordList
    }
  }
}
