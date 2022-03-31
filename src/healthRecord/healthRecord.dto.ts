export class HealthDataField {
  name: string
  unit: string
}

export class UpdateHealthrecordDto {
  hrName: string
  imageid: string
  listField: HealthDataField[]
}