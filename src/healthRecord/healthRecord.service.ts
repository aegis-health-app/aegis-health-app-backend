import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { introspectionFromSchema } from 'graphql';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { Repository } from 'typeorm';
import { AddHealthrecordDto } from './healthRecord.dto';
import { AllHealthRecords, HealthRecord } from './healthRecord.interface';


@Injectable()
export class HealthRecordService {

  constructor(
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
    private healthColumnRepository: Repository<HealthColumn>
  ) { }

  async getHealthRecord(uid: number): Promise<AllHealthRecords> {
    const healthRecordList = await this.healthRecordRepository.find(
      {
        where:
          { uid: uid },
      }
    )
    if (!healthRecordList)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)
    return {
      uid: uid,
      listHealthRecords: healthRecordList
    }
  }

  async addHealthRecord(uid: number, info: AddHealthrecordDto): Promise<string> {
    const user = await this.healthRecordRepository.findOne(
      {
        where:
          { uid: uid },
      }
    )
    if (!user)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND) // 404
    if (!info.hrName || !info.imageid || !info.listField)
      throw new HttpException("Information to be added missing or incomplete", HttpStatus.UNSUPPORTED_MEDIA_TYPE) // 415
    await this.healthRecordRepository.save({
      hrName: info.hrName,
      imageid: info.imageid,
      uid: uid,
    })
    for (let i = 0; i < info.listField.length; i++) {
      await this.healthColumnRepository.save({
        columnId:1,
          uid: uid,
        hrName: info.hrName,
          columnName: info.listField[0],
        unit: info.listField[1]
      })
    }

    return ''
  }


  async deleteHealthRecord(uid: number): Promise<string> {
    return ''
  }

}
