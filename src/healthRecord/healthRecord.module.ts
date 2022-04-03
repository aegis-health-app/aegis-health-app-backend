import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord as HealthRecordEntity } from 'src/entities/healthRecord.entity';
import { User } from 'src/entities/user.entity';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
  imports: [UserModule, TypeOrmModule.forFeature([User, HealthRecordEntity, HealthColumn, HealthData])],
  exports: [HealthRecordService],
})
export class HealthRecordModule { }