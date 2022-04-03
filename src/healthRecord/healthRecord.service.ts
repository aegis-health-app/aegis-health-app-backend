import { Injectable } from '@nestjs/common';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { getManager } from 'typeorm';
import { HealthDataDto, HealthRecordTableDto, Timespan } from './dto/healthRecord.dto';
import { healthDataRawInterface } from './healthRecord.interface';

@Injectable()
export class HealthRecordService {
  constructor() {}

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

  private healthDataFormatter(healthDataRaw: healthDataRawInterface[], columnNames: string[]): HealthDataDto[] {
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

  private analyseValues(healthData: HealthDataDto[]) {
    const values = healthData.map((h) => Number(h.values[0]));

    const mean = Number((values.reduce((cumulativeSum, b) => cumulativeSum + b, 0) / values.length).toFixed(2));
    const max = Math.max(...values);
    const min = Math.min(...values);
    return {
      mean: mean,
      min: min,
      max: max,
    };
  }

  async getHealthAnalytics(eid, healthRecordName, recordColumnName, timespan) {
    const currentTimeUnix = new Date().getTime();
    const millisecInOneDay = 86400000;
    let startQueryUnix;

    switch (timespan) {
      case Timespan.Week:
        startQueryUnix = currentTimeUnix - millisecInOneDay;
        console.log('in week');
        break;
      case Timespan.TwoWeeks:
        startQueryUnix = currentTimeUnix - 2 * millisecInOneDay;
        console.log('in 2 week');
        break;
      case Timespan.Month:
        console.log('in month');
        startQueryUnix = currentTimeUnix - 30 * millisecInOneDay;
        console.log(startQueryUnix);
        break;
      case Timespan.ThreeMonths:
        startQueryUnix = currentTimeUnix - 90 * millisecInOneDay;
        console.log('in 3 month');
        break;
      case Timespan.Year:
        startQueryUnix = currentTimeUnix - 365 * millisecInOneDay;
        console.log('in year');
        break;
      default:
        startQueryUnix = 0;
    }

    const startQueryDate = new Date(startQueryUnix);

    const healthDataQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
      .addSelect('hr.imageId', 'imageId')
      .addSelect('hc.columnName', 'columnName')
      .addSelect('hc.unit', 'unit')
      .addSelect('hd.value', 'value')
      // .addSelect("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')", 'timestamp')
      .addSelect('hd.timestamp', 'timestamp')
      .from(HealthRecord, 'hr')
      .innerJoin(HealthColumn, 'hc', 'hr.uid = hc.uid AND hr.hrName = hc.hrName')
      .innerJoin(HealthData, 'hd', 'hc.columnName = hd.columnName AND hc.hrName = hd.hrName AND hc.uid = hd.uid')
      .where('hr.uid = :uid', { uid: eid })
      .andWhere('hr.hrName = :hrName', { hrName: healthRecordName })
      .andWhere('hc.columnName = :columnName', { columnName: recordColumnName })
      // .andWhere('hd.timestamp > :startQueryDate', { startQueryDate: startQueryDate })
      .orderBy("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')");

    const healthDataRaw = await healthDataQuery.getRawMany();

    const hrName = healthDataRaw[0].hrName;
    const imageId = healthDataRaw[0].imageId;
    const columnName = healthDataRaw[0].columnName;
    const unit = healthDataRaw[0].unit;
    const filteredHealthDataRaw = healthDataRaw.filter((h) => h.timestamp >= startQueryDate);

    const healthData = this.healthDataFormatter(filteredHealthDataRaw, [columnName]);
    const { min, max, mean } = this.analyseValues(healthData);
    const result = {
      imageId: imageId,
      tableName: hrName,
      columnNames: columnName,
      units: unit,
      max: max,
      min: min,
      mean: mean,
      data: healthData,
      date: new Date(2022, 2, 1),
    };

    return result;
  }
}
