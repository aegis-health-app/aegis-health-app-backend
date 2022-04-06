// Raw data queried from MySql
export interface healthTableDataRawInterface extends HealthDataRawInterface {
  imageId: string;
}
export interface HealthAnalyticsDataRawInterface extends HealthDataRawInterface {}

export interface HealthDataRawInterface {
  hrName: string;
  columnName: string;
  unit: string;
  value: number;
  timestamp: Date;
}
