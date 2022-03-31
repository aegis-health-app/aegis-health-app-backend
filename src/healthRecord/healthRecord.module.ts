import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { User } from 'src/entities/user.entity';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';
import { HealthRecord as HealthRecordEntity } from 'src/entities/healthRecord.entity';

@Module({
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
  imports: [TypeOrmModule.forFeature([User, HealthRecordEntity, HealthColumn])],
})
export class HealthRecordModule { }
