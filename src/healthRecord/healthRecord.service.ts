import { Injectable } from '@nestjs/common';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { getManager } from 'typeorm';
import { HealthDataDto, HealthRecordDto } from './dto/healthRecord.dto';

@Injectable()
export class HealthRecordService {
  constructor() {}

  async getHealthData(uid: number, healthRecordName: string): Promise<HealthRecordDto> {
    const healthDataQuery = getManager()
      .createQueryBuilder()
      .select('hr.hrName', 'hrName')
      .addSelect('hc.columnName', 'columnName')
      .addSelect('hc.unit', 'unit')
      .addSelect('hd.value', 'value')
      .addSelect("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')", 'timestamp')
      .from(HealthRecord, 'hr')
      .innerJoin(HealthColumn, 'hc', 'hr.uid = hc.uid AND hr.hrName = hc.hrName')
      .innerJoin(HealthData, 'hd', 'hc.columnName = hd.ColumnName AND hc.hrName = hd.hrName AND hc.uid = hd.uid')
      .where('hr.uid = :uid', { uid: uid })
      .andWhere('hr.hrName = :hrName', { hrName: healthRecordName })
      .orderBy("DATE_FORMAT(hd.timestamp, '%Y-%m-%d %H:00:00')");

    const healthDataRaw = await healthDataQuery.getRawMany();
    const distinctValueByColumns = this.extractDistinctValueByColumns(healthDataRaw, ['columnName', 'unit']);

    const columnNames = [];
    const units = [];
    distinctValueByColumns.map((d) => {
      columnNames.push(d.columnName);
      units.push(d.unit);
    });

    const healthData = this.healthDataFormatter(healthDataRaw, columnNames);
    const result = {
      tableName: healthRecordName,
      columnNames: columnNames,
      units: units,
      data: healthData,
    };

    return result;
  }

  private healthDataFormatter(healthDataRaw, columnNames): HealthDataDto[] {
    const columnNumbers = columnNames.length;
    const healthData = [];
    healthDataRaw.map((h) => {
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

  private extractDistinctValueByColumns(rawTable, columns): Array<any> {
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
