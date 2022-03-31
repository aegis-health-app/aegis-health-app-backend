import { Module } from '@nestjs/common';
import { NotificationService } from './notification.service';
import { UserModule } from 'src/user/user.module';
import { NotificationController } from './notification.controller';

@Module({
  controllers: [NotificationController],
  providers: [NotificationService],
  exports: [NotificationService],
})
export class NotificationModule {}
