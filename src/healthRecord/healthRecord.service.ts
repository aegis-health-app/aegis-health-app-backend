import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthRecord as HealthRecordEntity } from 'src/entities/healthRecord.entity';
import { User } from 'src/entities/user.entity';
import { Repository } from 'typeorm';
import { AllHealthRecord, AddHealthrecord } from './healthRecord.interface';
import { HealthData } from 'src/entities/healthData.entity';
import { getManager } from 'typeorm';
import { HealthDataDto, healthDataRawDto, HealthRecordTableDto } from './dto/healthRecord.dto';

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
      throw new HttpException("No records found for this elderly", HttpStatus.BAD_REQUEST)
    return {
      listHealthRecord: healthRecordList
    }

  }

  async addHealthRecord(uid: number, info: AddHealthrecord): Promise<string> {

    const user = await this.userRepository.findOne({ where: { uid: uid, }, })
    if (!user)
      throw new HttpException("User not found", HttpStatus.BAD_REQUEST)

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
      throw new HttpException("User not found", HttpStatus.BAD_REQUEST)

    const deleteRecord = await this.healthRecordRepository.findOne({ where: { uid: uid, hrName: hrName }, })
    if (!deleteRecord)
      throw new HttpException("This health record doesn't exist", HttpStatus.CONFLICT)

    user.healthRecords = user.healthRecords.filter(function (healthRecord) {
      return healthRecord.hrName !== hrName
    })
    await this.healthRecordRepository.save(user)
    return 'Complete'

  }
  async getHealthData(uid: number, healthRecordName: string): Promise<HealthRecordTableDto> {
    const healthDataQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
      .addSelect('hr.imageId', 'imageId')
      .addSelect('hc.columnName', 'columnName')
      .addSelect('hc.unit', 'unit')
      .addSelect('hd.value', 'value')
      .addSelect("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')", 'timestamp')
      .from(HealthRecordEntity, 'hr')
      .innerJoin(HealthColumn, 'hc', 'hr.uid = hc.uid AND hr.hrName = hc.hrName')
      .innerJoin(HealthData, 'hd', 'hc.columnName = hd.columnName AND hc.hrName = hd.hrName AND hc.uid = hd.uid')
      .where('hr.uid = :uid', { uid: uid })
      .andWhere('hr.hrName = :hrName', { hrName: healthRecordName })
      .orderBy("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')");

    const healthDataRaw = await healthDataQuery.getRawMany();
    const distinctValueByColumns = this.extractDistinctValueByColumns(healthDataRaw, ['columnName', 'unit']);

    const hrName = healthDataRaw[0].hrName;
    const imageId = healthDataRaw[0].imageId;
    const columnNames = [];
    const units = [];
    distinctValueByColumns.map((d) => {
      columnNames.push(d.columnName);
      units.push(d.unit);
    });

    const healthData = this.healthDataFormatter(healthDataRaw, columnNames);
    const result = {
      imageId: imageId,
      tableName: hrName,
      columnNames: columnNames,
      units: units,
      data: healthData,
    };

    return result;
  }

  private healthDataFormatter(healthDataRaw: healthDataRawDto[], columnNames: string[]): HealthDataDto[] {
    const columnNumbers = columnNames.length;
    const healthData = [];
    healthDataRaw.forEach((h) => {
      healthData.find((v, i) => {
        if (v.dateTime === h.timestamp) {
          v.values[columnNames.indexOf(h.columnName)] = h.value.toString();
          healthData[i] = {
            dateTime: h.timestamp,
            values: v.values,
          };
          return true;
        }
      });

      const values = Array(columnNumbers).fill('');
      values[columnNames.indexOf(h.columnName)] = h.value.toString();
      return healthData.push({
        dateTime: h.timestamp,
        values: values,
      });
    });

    return healthData;
  }

  private extractDistinctValueByColumns(rawTable: any[], columns: string[]): Array<any> {
    const allColumns = [];
    rawTable.map((i) => {
      const value = {};
      columns.map((column) => {
        value[column] = i[column];
      });
      allColumns.push(value);
    });

    const distinctiveKey = columns[0];
    const extractedColumns = [...new Map(allColumns.map((column) => [column[distinctiveKey], column])).values()];
    return extractedColumns;
  }
}
