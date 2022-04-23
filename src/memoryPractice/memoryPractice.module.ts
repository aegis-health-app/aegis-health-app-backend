import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { User } from 'src/entities/user.entity';
import { GoogleModule } from 'src/google-cloud/google.module';
import { UserModule } from 'src/user/user.module';
import { MemoryPracticeController } from './memoryPractice.controller';
import { MemoryPracticeService } from './memoryPractice.service';

@Module({
  imports: [TypeOrmModule.forFeature([MemoryPracticeQuestion, MemoryPracticeAnswer, MultipleChoiceQuestion, User]), UserModule, GoogleModule],
  controllers: [MemoryPracticeController],
  providers: [MemoryPracticeService],
})
export class MemoryPracticeModule {}
