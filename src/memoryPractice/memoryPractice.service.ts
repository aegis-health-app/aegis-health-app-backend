import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { User } from 'src/entities/user.entity';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { Repository } from 'typeorm';
import { AllQuestionsCaretaker, QuestionDetails } from './memoryPractice.interface';

@Injectable()
export class MemoryPracticeService {

  constructor(
    private readonly googleStorageService: GoogleCloudStorage,
    @InjectRepository(User)
    private userRepository: Repository<User>,
    @InjectRepository(MemoryPracticeQuestion)
    private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
    @InjectRepository(MemoryPracticeAnswer)
    private memoryPracticeAnswerRepository: Repository<MemoryPracticeAnswer>,
    @InjectRepository(MultipleChoiceQuestion)
    private multipleChoiceQuestionRepository: Repository<MultipleChoiceQuestion>,
  ) { }

  async getAllQuestions(eid: number): Promise<AllQuestionsCaretaker> {
    const questionsList = await this.memoryPracticeQuestionRepository.find({ where: { uid: eid } });
    return {
      questions: questionsList
    }
  }

  async getSelectedQuestion(eid: number, mid: number): Promise<QuestionDetails> {
    const question = await this.memoryPracticeQuestionRepository.findOne({ where: { uid: eid, mid: mid } });
    if (!question)
      throw new HttpException('This question cannot be found', HttpStatus.BAD_REQUEST);
    const MCQ = await this.multipleChoiceQuestionRepository.findOne({ where: { mid: mid } })
    const isMCQ = true
    if (!MCQ) {
      return {
        question: question.question,
        imageid: question.imageid,
        isMCQ: !isMCQ,
      }
    } else {
      return {
        question: question.question,
        imageid: question.imageid,
        isMCQ: isMCQ,
        choice1: MCQ.choice1,
        choice2: MCQ.choice2,
        choice3: MCQ.choice3,
        choice4: MCQ.choice4,
        correctAnswer: MCQ.correctAnswer
      }
    }
  }
}
