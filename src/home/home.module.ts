import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { HomeController } from './home.controller';
import { HomeService } from './home.service';
import { Module as ModuleEntity } from 'src/entities/module.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, ModuleEntity])],
  providers: [HomeService],
  controllers: [HomeController],
})
export class HomeModule {}
