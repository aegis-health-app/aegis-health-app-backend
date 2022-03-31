export class HealthRecord {
  hrName: string
  imageid: string
}

export class AllHealthRecords {
  uid: number
  listHealthRecords: HealthRecord[]
}

export class HealthDataField {
  name: string
  unit: string
}

export class AddHealthrecord {
  hrName: string
  imageid: string
  listField: HealthDataField[]
}