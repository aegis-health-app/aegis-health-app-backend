import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from 'src/auth/auth.module';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { HealthData } from 'src/entities/healthData.entity';
import { HealthRecord } from 'src/entities/healthRecord.entity';
import { User } from 'src/entities/user.entity';
import { UserModule } from 'src/user/user.module';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';

@Module({
  imports: [TypeOrmModule.forFeature([HealthRecord, HealthColumn, HealthData, User]), UserModule],
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
  exports: [HealthRecordService],
})
export class HealthRecordModule {}
