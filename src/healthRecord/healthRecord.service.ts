import { Injectable, NotFoundException } from '@nestjs/common';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { getManager } from 'typeorm';
import {
  HealthTableDataDto,
  HealthAnalyticsDataDto,
  HealthRecordAnalyticsDto,
  HealthRecordTableDto,
  Timespan,
  analyticDataDto,
} from './dto/healthRecord.dto';
import { healthTableDataRawInterface, HealthAnalyticsDataRawInterface, HealthDataRawInterface } from './healthRecord.interface';

@Injectable()
export class HealthRecordService {
  constructor() {}

  async checkHealthRecordExist(elderlyId: number, healthRecordName: string) {
    const healthRecordQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
      .from(HealthRecord, 'hr')
      .where('hr.uid = :uid', { uid: elderlyId });

    const healthRecordRaw = await healthRecordQuery.getRawMany();
    if (!healthRecordRaw.length) throw new NotFoundException('Health Recod Name Not Found');

    const isMatched = healthRecordRaw.find((hr) => hr.hrName === healthRecordName);
    if (!isMatched) throw new NotFoundException('Health Record Name Not Found');

    return;
  }

  async checkHealthColumnExist(elderlyId: number, healthRecordName: string, healthColumnName: string) {
    const healthColumnQuery = getManager()
      .createQueryBuilder()
      .select('hc.columnName', 'columnName')
      .from(HealthRecord, 'hr')
      .innerJoin(HealthColumn, 'hc', 'hr.uid = hc.uid AND hr.hrName = hc.hrName')
      .where('hr.uid = :uid', { uid: elderlyId })
      .andWhere('hr.hrName = :hrName', { hrName: healthRecordName });

    const healthColumnRaw = await healthColumnQuery.getRawMany();
    if (!healthColumnRaw.length) throw new NotFoundException('Health Column Name Not Found');

    const isMatched = healthColumnRaw.find((hc) => hc.columnName === healthColumnName);
    if (!isMatched) throw new NotFoundException('Health Column Name Not Found');

    return;
  }

  async getHealthTable(uid: number, healthRecordName: string): Promise<HealthRecordTableDto> {
    const result: HealthRecordTableDto = {
      imageId: '',
      tableName: healthRecordName,
      columnNames: [],
      units: [],
      data: [],
    };
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

    const healthDataRaw: healthTableDataRawInterface[] = await healthDataQuery.getRawMany();
    if (!healthDataRaw.length) return result;

    const distinctValueByColumns = this.extractDistinctValueByColumns<healthTableDataRawInterface, { columnName: string; unit: string }>(
      healthDataRaw,
      ['columnName', 'unit']
    );
    distinctValueByColumns.map((d) => {
      result.columnNames.push(d.columnName);
      result.units.push(d.unit);
    });

    result.imageId = healthDataRaw[0].imageId;
    result.data = this.healthDataFormatter<healthTableDataRawInterface>(healthDataRaw, result.columnNames, 'table') as HealthTableDataDto[];

    return result;
  }

  private healthDataFormatter<T extends HealthDataRawInterface>(
    healthDataRaw: Array<T>,
    columnNames: string[],
    format: 'table' | 'analytics'
  ): HealthTableDataDto[] | HealthAnalyticsDataDto[] {
    const columnNumbers = columnNames.length;
    if (format === 'analytics' && columnNumbers === 1) {
      const healthData: HealthAnalyticsDataDto[] = healthDataRaw.map((h) => ({
        dateTime: h.timestamp,
        value: h.value,
      }));

      return healthData;
    }

    const healthData: HealthTableDataDto[] = [];
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

  private extractDistinctValueByColumns<U, T>(rawTable: U[], columns: string[]): Array<T> {
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

  private analyseValues(healthData: HealthAnalyticsDataDto[]): analyticDataDto {
    const values = healthData.map((h) => Number(h.value));

    const mean = Number((values.reduce((cumulativeSum, b) => cumulativeSum + b, 0) / values.length).toFixed(2));
    const max = Math.max(...values);
    const min = Math.min(...values);

    const analyticData = {
      mean: mean,
      max: max,
      min: min,
    };
    return analyticData;
  }

  async getHealthAnalytics(eid: number, healthRecordName: string, columnName: string, timespan: Timespan): Promise<HealthRecordAnalyticsDto> {
    const result: HealthRecordAnalyticsDto = {
      tableName: healthRecordName,
      columnName: columnName,
      unit: '',
      analyticData: {
        mean: 0,
        min: 0,
        max: 0,
      },
      data: [],
    };

    const currentTimeUnix = new Date().getTime();
    const millisecInOneDay = 86400000;
    let startQueryUnix;

    switch (timespan) {
      case Timespan.Week:
        startQueryUnix = currentTimeUnix - millisecInOneDay;
        break;
      case Timespan.TwoWeeks:
        startQueryUnix = currentTimeUnix - 2 * millisecInOneDay;
        break;
      case Timespan.Month:
        startQueryUnix = currentTimeUnix - 30 * millisecInOneDay;
        break;
      case Timespan.ThreeMonths:
        startQueryUnix = currentTimeUnix - 90 * millisecInOneDay;
        break;
      case Timespan.Year:
        startQueryUnix = currentTimeUnix - 365 * millisecInOneDay;
        break;
      default:
        startQueryUnix = 0;
    }

    const startQueryDate = new Date(startQueryUnix);

    const healthDataQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
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
      .andWhere('hc.columnName = :columnName', { columnName: columnName })
      .andWhere('hd.timestamp > :startQueryDate', { startQueryDate: startQueryDate })
      .orderBy("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')");

    const healthDataRaw: HealthAnalyticsDataRawInterface[] = await healthDataQuery.getRawMany();
    if (!healthDataRaw.length) return result;

    const filteredHealthDataRaw = healthDataRaw.filter((h) => h.timestamp >= startQueryDate);

    result.unit = healthDataRaw[0].unit;
    result.data = this.healthDataFormatter<HealthAnalyticsDataRawInterface>(
      filteredHealthDataRaw,
      [columnName],
      'analytics'
    ) as HealthAnalyticsDataDto[];
    result.analyticData = this.analyseValues(result.data);

    return result;
  }
}
