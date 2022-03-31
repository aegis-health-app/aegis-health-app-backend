import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthRecord as HealthRecordEntity } from 'src/entities/healthRecord.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AllHealthRecord, AddHealthrecord } from './healthRecord.interface';


@Injectable()
export class HealthRecordService {

  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(HealthRecordEntity)
    private healthRecordRepository: Repository<HealthRecordEntity>,
    @InjectRepository(HealthColumn)
    private healthColumnRepository: Repository<HealthColumn>,
  ) { }

  async getHealthRecord(uid: number): Promise<AllHealthRecord> {

    const healthRecordList = await this.healthRecordRepository.find({ where: { uid: uid }, })
    if (!healthRecordList)
      throw new HttpException("No records found for this user", HttpStatus.NOT_FOUND)
    return {
      listHealthRecord: healthRecordList
    }

  }

  async addHealthRecord(uid: number, info: AddHealthrecord): Promise<string> {

    const user = await this.userRepository.findOne({ where: { uid: uid, }, })
    if (!user)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)

    const temp = await this.healthRecordRepository.findOne({ where: { hrName: info.hrName }, })
    if (temp)
      throw new HttpException("Health record name is repeated", HttpStatus.CONFLICT)
    await this.healthRecordRepository.save({
      hrName: info.hrName,
      imageid: info.imageid,
      uid: uid,
    })

    info.listField.forEach(async (_, i) => {
      await this.healthColumnRepository.save({
        columnName: info.listField[i][0],
        uid: uid,
        hrName: info.hrName,
        unit: info.listField[i][1],
      })
    })
    return 'Complete'

  }


  async deleteHealthRecord(uid: number, hrName: string): Promise<string> {

    const user = await this.userRepository.findOne({ where: { uid: uid } },)
    if (!user)
      throw new HttpException("User not found", HttpStatus.NOT_FOUND)

    const deleteRecord = await this.healthRecordRepository.findOne({ where: { uid: uid, hrName: hrName }, })
    if (!deleteRecord)
      throw new HttpException("This health record doesn't exist", HttpStatus.CONFLICT)

    user.healthRecords = user.healthRecords.filter(function (healthRecord) {
      return healthRecord.hrName !== hrName
    })
    await this.healthRecordRepository.save(user)
    return 'Complete'

  }

}
