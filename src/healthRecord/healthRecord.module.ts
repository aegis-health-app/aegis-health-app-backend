import { Module } from '@nestjs/common';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';

@Module({
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
})
export class HealthRecordModule { }
