import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/user.entity';
import { ElderlyHomeController } from './elderlyHome.controller';
import { ElderlyHomeService } from './elderlyHome.service';

@Module({
    imports: [TypeOrmModule.forFeature([User])],
    providers: [ElderlyHomeService],
    controllers: [ElderlyHomeController],
})
export class ElderlyHomeModule {}
