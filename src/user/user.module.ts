import { Module } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleModule } from 'src/google-cloud/google.module';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, GoogleModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule {}
