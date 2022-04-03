import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { getManager } from 'typeorm';
import { AddHealthDataDto, DeleteHealthDataDto, EditHealthRecordDto, HealthDataDto, healthDataRawDto, HealthRecordTableDto } from './dto/healthRecord.dto';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { BucketName } from 'src/google-cloud/google-cloud.interface';

@Injectable()
export class HealthRecordService {
  constructor(
    @InjectRepository(HealthColumn)
    private healthColumnRepository: Repository<HealthColumn>,
    @InjectRepository(HealthData)
    private healthDataRepository: Repository<HealthData>,
    @InjectRepository(HealthRecord)
    private healthRecordRepository: Repository<HealthRecord>,
    private googleStorageService: GoogleCloudStorage
  ) { }

  async getHealthData(uid: number, healthRecordName: string): Promise<HealthRecordTableDto> {
    const healthDataQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
      .addSelect('hr.imageId', 'imageId')
      .addSelect('hc.columnName', 'columnName')
      .addSelect('hc.unit', 'unit')
      .addSelect('hd.value', 'value')
      .addSelect("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')", 'timestamp')
      .from(HealthRecord, 'hr')
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
        values: values
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

  async addHealthData(uid: number, healthData: AddHealthDataDto): Promise<boolean> {
    for (let i = 0; i < healthData.data.length; i++) {
      const healthColumn = await this.healthColumnRepository.findOne(
        {
          where:
          {
            uid: uid,
            hrName: healthData.hrName,
            columnName: healthData.data[i].columnName
          },
        })
      if (!healthColumn)
        throw new HttpException("Column not found", HttpStatus.NOT_FOUND)
      const existHealthData = await this.healthDataRepository.findOne(
        {
          where:
          {
            uid: uid,
            hrName: healthData.hrName,
            columnName: healthData.data[i].columnName,
            timestamp: healthData.timestamp
          },
        })
      if (existHealthData)
        throw new HttpException("Health data at that timestamp already exists", HttpStatus.CONFLICT)
      const newHealthData = this.healthDataRepository.create({
        uid: uid,
        hrName: healthData.hrName,
        columnName: healthData.data[i].columnName,
        timestamp: healthData.timestamp,
        value: healthData.data[i].value
      })
      await this.healthDataRepository.insert(newHealthData)
    }
    return true
  }

  async deleteHealthData(uid: number, healthData: DeleteHealthDataDto): Promise<boolean> {
    const existHealthData = await this.healthDataRepository.delete({
      uid: uid,
      hrName: healthData.hrName,
      columnName: healthData.columnName,
      timestamp: healthData.timestamp
    })
    if (!existHealthData) {
      throw new HttpException("Health data not found", HttpStatus.NOT_FOUND)
    }
    return true
  }

  async editHealthRecord(uid: number, updatedHealthRecord: EditHealthRecordDto): Promise<string> {
    const healthRecord = await this.healthRecordRepository.findOne(
      {
        where:
        {
          uid: uid,
          hrName: updatedHealthRecord.hrName,
        },
      })
    if (!healthRecord) {
      throw new HttpException("Health record not found", HttpStatus.NOT_FOUND)
    }

    const buffer = Buffer.from(updatedHealthRecord.image.base64, 'base64');
    if (buffer.byteLength > 5000000) {
      throw new HttpException("Image too large", HttpStatus.BAD_REQUEST)
    }
    const imageUrl = await this.googleStorageService.uploadImage(uid, buffer, BucketName.HealthRecord);

    await this.healthRecordRepository.update({
      uid: uid,
      hrName: updatedHealthRecord.hrName
    }, {imageid: imageUrl})
    return imageUrl
  }
}