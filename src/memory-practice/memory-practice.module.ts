import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { MemoryPracticeController } from './memory-practice.controller';
import { MemoryPracticeService } from './memory-practice.service';
import { UserModule } from '../user/user.module'

@Module({
  imports: [TypeOrmModule.forFeature([MemoryPracticeQuestion, MemoryPracticeAnswer, MultipleChoiceQuestion]), UserModule],
  controllers: [MemoryPracticeController],
  providers: [MemoryPracticeService]
})
export class MemoryPracticeModule {}
