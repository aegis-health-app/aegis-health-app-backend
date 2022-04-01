import { MiddlewareConsumer, Module, NestModule, RequestMethod } from '@nestjs/common';
import { UserService } from './user.service';
import { UserController } from './user.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../entities/user.entity';
import { AuthModule } from 'src/auth/auth.module';
import { GoogleModule } from 'src/google-cloud/google.module';
import { json, urlencoded } from 'express';

@Module({
  imports: [TypeOrmModule.forFeature([User]), AuthModule, GoogleModule],
  controllers: [UserController],
  providers: [UserService],
  exports: [UserService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(json({ limit: '5mb' }), urlencoded({ limit: '5mb', extended: true }))
      .forRoutes({ path: 'user/profile/image', method: RequestMethod.POST });
  }
}
