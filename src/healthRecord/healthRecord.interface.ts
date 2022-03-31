export class HealthRecord {
  hrName: string
  imageid: string
}

export class AllHealthRecords {
  uid: number
  listHealthRecords: HealthRecord[]
}