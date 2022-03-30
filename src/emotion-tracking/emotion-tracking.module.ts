import { Module } from '@nestjs/common';
import { EmotionTrackingController } from './emotion-tracking.controller';
import { EmotionTrackingService } from './emotion-tracking.service'
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { User } from 'src/entities/user.entity'
import { Module as ModuleEntity } from 'src/entities/module.entity';
import { UserModule } from '../user/user.module'

@Module({
    imports: [TypeOrmModule.forFeature([EmotionalRecord, User, ModuleEntity]), UserModule],
    controllers: [EmotionTrackingController],
    providers: [EmotionTrackingService]
})
export class EmotionTrackingModule {}