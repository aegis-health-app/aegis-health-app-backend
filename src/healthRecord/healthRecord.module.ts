import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HealthColumn } from 'src/entities/healthColumn.entity';
import { User } from 'src/entities/user.entity';
import { HealthRecordController } from './healthRecord.controller';
import { HealthRecordService } from './healthRecord.service';
import { HealthRecord as HealthRecordEntity } from 'src/entities/healthRecord.entity';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [HealthRecordController],
  providers: [HealthRecordService],
  imports: [UserModule, TypeOrmModule.forFeature([User, HealthRecordEntity, HealthColumn])],
})
export class HealthRecordModule { }
