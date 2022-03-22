import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { OtpModule } from '../otp/otp.module';
import { User } from 'src/entities/user.entity';
import { SettingController } from './setting.controller';
import { SettingService } from './setting.service';

@Module({
  controllers: [SettingController],
  providers: [SettingService],
  imports: [OtpModule,TypeOrmModule.forFeature([User])],
})
export class SettingModule {
}
