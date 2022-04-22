import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { Repository } from 'typeorm';
import { AllQuestionsCaretaker, CreateQuestion, EditQuestion, QuestionDetails } from './memoryPractice.interface';

@Injectable()
export class MemoryPracticeService {

  constructor(
    private readonly googleStorageService: GoogleCloudStorage,
    @InjectRepository(MemoryPracticeQuestion)
    private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
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

  async createQuestion(createQuestion: CreateQuestion): Promise<string> {
    let imageid;
    if (createQuestion.image) {
      const buffer = Buffer.from(createQuestion.image.base64, 'base64');
      if (buffer.byteLength > 5000000) {
        throw new HttpException('Image is too large', HttpStatus.NOT_ACCEPTABLE);
      }
      imageid = await this.googleStorageService.uploadImage(createQuestion.elderlyuid, buffer, BucketName.MemoryRecall, createQuestion.question);
    } else {
      imageid = null;
    }
    const nextID = (await this.memoryPracticeQuestionRepository.query("SELECT MAX(mid) AS max FROM MemoryPracticeQuestion"))[0].max + 1
    await this.memoryPracticeQuestionRepository.save({
      mid: nextID.toString(),
      question: createQuestion.question,
      isSelected: true,
      imageid: imageid,
      uid: createQuestion.elderlyuid
    })
    if (createQuestion.isMCQ) {
      await this.multipleChoiceQuestionRepository.save({
        choice1: createQuestion.choice1,
        choice2: createQuestion.choice2,
        choice3: createQuestion.choice3,
        choice4: createQuestion.choice4,
        correctAnswer: createQuestion.correctAnswer,
        mid: nextID.toString()
      })
    }
    return 'Complete'
  }

  async editQuestion(editQuestion: EditQuestion): Promise<string> {
    const mid = editQuestion.mid
    if (!(await this.memoryPracticeQuestionRepository.findOne({ where: { mid: mid } })))
      throw new HttpException("This mid doesn't exist", HttpStatus.BAD_REQUEST);
    const uid = editQuestion.elderlyuid
    let imageid;
    if (editQuestion.image) {
      const buffer = Buffer.from(editQuestion.image.base64, 'base64');
      if (buffer.byteLength > 5000000) {
        throw new HttpException('Image is too large', HttpStatus.NOT_ACCEPTABLE);
      }
      imageid = await this.googleStorageService.uploadImage(editQuestion.elderlyuid, buffer, BucketName.MemoryRecall, editQuestion.question);
    } else {
      imageid = null;
    }
    await this.memoryPracticeQuestionRepository.update({ mid, uid },
      {
        question: editQuestion.question,
        isSelected: true,
        imageid: imageid,
      })

    const wasMCQ = await this.multipleChoiceQuestionRepository.find({ where: { mid: mid } })
    if (wasMCQ.length !== 0 && !editQuestion.isMCQ) {
      const deleteQuestion = await this.multipleChoiceQuestionRepository.findOne({ where: { mid: mid } });
      await this.multipleChoiceQuestionRepository.delete(deleteQuestion)
    }
    else if (wasMCQ.length === 0 && editQuestion.isMCQ) {
      await this.multipleChoiceQuestionRepository.save({
        choice1: editQuestion.choice1,
        choice2: editQuestion.choice2,
        choice3: editQuestion.choice3,
        choice4: editQuestion.choice4,
        correctAnswer: editQuestion.correctAnswer,
        mid: mid
      })
    } else {
      await this.multipleChoiceQuestionRepository.update(mid,
        {
          choice1: editQuestion.choice1,
          choice2: editQuestion.choice2,
          choice3: editQuestion.choice3,
          choice4: editQuestion.choice4,
          correctAnswer: editQuestion.correctAnswer,
        })
    }
    return 'Complete'
  }

  async deleteQuestion(mid: string): Promise<string> {
    const deleteQuestion = await this.memoryPracticeQuestionRepository.findOne({ where: { mid: mid } });
    if (!deleteQuestion)
      throw new HttpException("This question doesn't exist", HttpStatus.BAD_REQUEST);
    await this.memoryPracticeQuestionRepository.delete(deleteQuestion)
    return 'Complete'
  }
}
