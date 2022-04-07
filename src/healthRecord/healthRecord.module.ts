import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { User } from 'src/entities/user.entity';
import { GoogleModule } from 'src/google-cloud/google.module';
import { UserModule } from 'src/user/user.module';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthRecord, HealthColumn, HealthData, User]), UserModule, GoogleModule],
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
  exports: [HealthRecordService],
})
export class HealthRecordModule { }