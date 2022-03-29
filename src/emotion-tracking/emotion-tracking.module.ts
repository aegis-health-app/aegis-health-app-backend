import { Module } from '@nestjs/common';
import { EmotionTrackingController } from './emotion-tracking.controller';
import { EmotionTrackingService } from './emotion-tracking.service'
import { TypeOrmModule } from '@nestjs/typeorm';
import { EmotionalRecord } from 'src/entities/emotionalRecord.entity';
import { User } from 'src/entities/user.entity'

@Module({
    imports: [TypeOrmModule.forFeature([EmotionalRecord, User])],
    controllers: [EmotionTrackingController],
    providers: [EmotionTrackingService]
})
export class EmotionTrackingModule {}