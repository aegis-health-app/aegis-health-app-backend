import { Module } from '@nestjs/common';
import { EmergencyService } from './emergency.service';
import { EmergencyController } from './emergency.controller';
import { NotificationModule } from '../notification.module';
import { UserModule } from 'src/user/user.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';

@Module({
  controllers: [EmergencyController],
  providers: [EmergencyService],
  imports: [NotificationModule, UserModule, TypeOrmModule.forFeature([User])],
})
export class EmergencyModule {}
