import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { NotificationModule } from '../notification.module';
import { UserModule } from 'src/user/user.module';

@Module({
  controllers: [EmergencyController],
  providers: [EmergencyService],
  imports: [NotificationModule, UserModule],
})
export class EmergencyModule {}
