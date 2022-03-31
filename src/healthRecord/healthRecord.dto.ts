export class HealthDataField {
  name: string
  unit: string
}

export class AddHealthrecordDto {
  hrName: string
  imageid: string
  listField: HealthDataField[]
}