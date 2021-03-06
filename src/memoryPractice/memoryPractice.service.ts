import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { UserService } from 'src/user/user.service';
import { BucketName } from 'src/google-cloud/google-cloud.interface';
import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';
import { Repository } from 'typeorm';
import {
  AllQuestionsCaretaker,
  CreateQuestion,
  EditQuestion,
  QuestionDetails,
  MultipleChoiceQuestion as McqInterface,
  MemoryPracticeQuestion as MemoryPracticeQuestionInterface,
  MemoryPracticeQuestionSet,
} from './memoryPractice.interface';
import { MemoryPracticeQuestionSetDto, CreateElderlyAnswersDto, GetHistoryDto, GetHistoryByTimestampDto } from './dto/memoryPractice.dto';

@Injectable()
export class MemoryPracticeService {
  constructor(
    private readonly googleStorageService: GoogleCloudStorage,
    private userService: UserService,
    @InjectRepository(MemoryPracticeQuestion)
    private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
    @InjectRepository(MultipleChoiceQuestion)
    private multipleChoiceQuestionRepository: Repository<MultipleChoiceQuestion>,
    @InjectRepository(MemoryPracticeAnswer)
    private memoryPracticeAnswerRepository: Repository<MemoryPracticeAnswer>
  ) {}

  async getAllQuestions(eid: number): Promise<AllQuestionsCaretaker> {
    const questionsList = await this.memoryPracticeQuestionRepository.find({ where: { uid: eid } });
    return {
      questions: questionsList,
    };
  }

  async getSelectedQuestion(eid: number, mid: number): Promise<QuestionDetails> {
    const question = await this.memoryPracticeQuestionRepository.findOne({ where: { uid: eid, mid: mid } });
    if (!question) throw new HttpException('This question cannot be found', HttpStatus.BAD_REQUEST);
    const MCQ = await this.multipleChoiceQuestionRepository.findOne({ where: { mid: mid } });
    const isMCQ = true;
    if (!MCQ) {
      return {
        question: question.question,
        imageid: question.imageid,
        isMCQ: !isMCQ,
      };
    } else {
      return {
        question: question.question,
        imageid: question.imageid,
        isMCQ: isMCQ,
        choice1: MCQ.choice1,
        choice2: MCQ.choice2,
        choice3: MCQ.choice3,
        choice4: MCQ.choice4,
        correctAnswer: MCQ.correctAnswer,
      };
    }
  }

  async editSelection(eid: number, mid: number, isSelected: string): Promise<string> {
    const question = await this.memoryPracticeQuestionRepository.findOne({ where: { uid: eid, mid: mid } });
    if (!question) throw new HttpException('This question cannot be found', HttpStatus.BAD_REQUEST);
    const isSelectedBoolean = isSelected === 'true';
    await this.memoryPracticeQuestionRepository.update(mid, {
      isSelected: isSelectedBoolean,
    });
    return 'Complete';
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
    const nextID = (await this.memoryPracticeQuestionRepository.query('SELECT MAX(mid) AS max FROM MemoryPracticeQuestion'))[0].max + 1;
    await this.memoryPracticeQuestionRepository.save({
      mid: nextID,
      question: createQuestion.question,
      isSelected: false,
      imageid: imageid,
      uid: createQuestion.elderlyuid,
    });
    if (createQuestion.isMCQ) {
      await this.multipleChoiceQuestionRepository.save({
        choice1: createQuestion.choice1,
        choice2: createQuestion.choice2,
        choice3: createQuestion.choice3,
        choice4: createQuestion.choice4,
        correctAnswer: createQuestion.correctAnswer,
        mid: nextID.toString(),
      });
    }
    return 'Complete';
  }

  async editQuestion(editQuestion: EditQuestion): Promise<string> {
    const mid = editQuestion.mid;
    const question = await this.memoryPracticeQuestionRepository.findOne({ where: { mid: mid } });
    if (!question) throw new HttpException("This mid doesn't exist", HttpStatus.BAD_REQUEST);
    const uid = editQuestion.elderlyuid;
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
    await this.memoryPracticeQuestionRepository.update(
      { mid, uid },
      {
        question: editQuestion.question,
        isSelected: question.isSelected,
        imageid: imageid,
      }
    );

    const wasMCQ = await this.multipleChoiceQuestionRepository.find({ where: { mid: mid } });
    if (wasMCQ.length !== 0 && !editQuestion.isMCQ) {
      const deleteQuestion = await this.multipleChoiceQuestionRepository.findOne({ where: { mid: mid } });
      await this.multipleChoiceQuestionRepository.delete(deleteQuestion);
    } else if (wasMCQ.length === 0 && editQuestion.isMCQ) {
      await this.multipleChoiceQuestionRepository.save({
        choice1: editQuestion.choice1,
        choice2: editQuestion.choice2,
        choice3: editQuestion.choice3,
        choice4: editQuestion.choice4,
        correctAnswer: editQuestion.correctAnswer,
        mid: mid
      });
    } else {
      await this.multipleChoiceQuestionRepository.update(mid, {
        choice1: editQuestion.choice1,
        choice2: editQuestion.choice2,
        choice3: editQuestion.choice3,
        choice4: editQuestion.choice4,
        correctAnswer: editQuestion.correctAnswer,
      });
    }
    return 'Complete';
  }

  async deleteQuestion(mid: number): Promise<string> {
    const deleteQuestion = await this.memoryPracticeQuestionRepository.findOne({ where: { mid: mid } });
    if (!deleteQuestion) throw new HttpException("This question doesn't exist", HttpStatus.BAD_REQUEST);
    await this.memoryPracticeQuestionRepository.delete(deleteQuestion);
    return 'Complete';
  }

  async getQuestionSet(eid: number): Promise<MemoryPracticeQuestionSetDto> {
    const questions = await this.memoryPracticeQuestionRepository
      .createQueryBuilder('question')
      .leftJoinAndSelect('question.users', 'user')
      .leftJoinAndSelect('question.multipleChoiceQuestion', 'multipleChoices')
      .where('user.uid = :uid', { uid: eid })
      .andWhere('question.isSelected = :isSelected', { isSelected: true })
      .getMany();

    const questionSet: MemoryPracticeQuestionSet = {
      questions: [],
    };
    for (const q of questions) {
      let multipleChoiceQuestion: McqInterface;
      if (q['multipleChoiceQuestion'] !== null) {
        multipleChoiceQuestion = {
          choice1: q['multipleChoiceQuestion']['choice1'],
          choice2: q['multipleChoiceQuestion']['choice2'],
          choice3: q['multipleChoiceQuestion']['choice3'],
          choice4: q['multipleChoiceQuestion']['choice4'],
          correctAnswer: q['multipleChoiceQuestion']['correctAnswer'],
        };
      } else {
        multipleChoiceQuestion = null;
      }

      const question: MemoryPracticeQuestionInterface = {
        mid: +q['mid'],
        question: q['question'],
        imageid: q['imageid'],
        multipleChoiceQuestion: multipleChoiceQuestion,
        isMultipleChoice: q['multipleChoiceQuestion'] !== null ? true : false,
      };
      questionSet['questions'].push(question);
    }
    return questionSet;
  }
  async createElderlyAnswers(eid: number, elderlyAnswers: CreateElderlyAnswersDto): Promise<{ message: string }> {
    const timestamp = new Date();
    const answers = elderlyAnswers['answers'];
    for (const answer of answers) {
      const memoryPracticeQuestion = await this.memoryPracticeQuestionRepository.findOne({
        where: {
          mid: answer['mid'],
        },
        relations: ['users'],
      });
      if (!memoryPracticeQuestion) {
        throw new HttpException('This question does not exist', HttpStatus.BAD_REQUEST);
      }
      if (memoryPracticeQuestion.users.uid !== eid) {
        throw new HttpException('This question does not belong to this elderly', HttpStatus.NOT_ACCEPTABLE);
      }
      const memoryPracticeAnswer = new MemoryPracticeAnswer();
      memoryPracticeAnswer.memoryPracticeQuestion = memoryPracticeQuestion;
      memoryPracticeAnswer.elderAnswer = answer['answer'];
      memoryPracticeAnswer.timestamp = timestamp;
      await this.memoryPracticeAnswerRepository.save(memoryPracticeAnswer);
    }
    return { message: 'Elderly answers are successfully recorded' };
  }

  async getHistory(eid: number, cid: number, limit = 10, offset = 0): Promise<GetHistoryDto> {
    await this.userService.checkRelationship(eid, cid);
    const records = await this.memoryPracticeAnswerRepository
      .createQueryBuilder('answer')
      .select("DATE_FORMAT(answer.timestamp, '%Y-%m-%d %H:%i:%S.%f')", 'timestamp')
      .innerJoin('answer.memoryPracticeQuestion', 'question')
      .leftJoin('question.multipleChoiceQuestion', 'multipleChoice')
      .where('question.uid = :uid', { uid: eid })
      .groupBy('answer.timestamp')
      .orderBy('answer.timestamp', 'DESC')
      .limit(limit)
      .offset(offset)
      .getRawMany();
    const timestamps = [];
    for (const record of records) {
      timestamps.push(record['timestamp']);
    }
    const history = {
      timestamps,
    };
    return history;
  }

  async getHistoryByTimestamp(eid: number, cid: number, timestamp: string): Promise<GetHistoryByTimestampDto> {
    await this.userService.checkRelationship(eid, cid);

    const questions = await this.memoryPracticeAnswerRepository
      .createQueryBuilder('answer')
      .select('answer.mid', 'mid')
      .addSelect("DATE_FORMAT(answer.timestamp, '%Y-%m-%d %H:%i:%S.%f')", 'timestamp')
      .addSelect('question.imageid', 'imageUrl')
      .addSelect('question.question', 'question')
      .addSelect('multipleChoice.choice1 IS NOT NULL', 'isMultipleChoice')
      .addSelect('answer.elderAnswer = multipleChoice.correctAnswer OR multipleChoice.correctAnswer IS NULL', 'isCorrect')
      .addSelect('multipleChoice.choice1', 'choice1')
      .addSelect('multipleChoice.choice2', 'choice2')
      .addSelect('multipleChoice.choice3', 'choice3')
      .addSelect('multipleChoice.choice4', 'choice4')
      .addSelect('multipleChoice.correctAnswer', 'correctAnswer')
      .addSelect('answer.elderAnswer', 'elderlyAnswer')
      .leftJoin('answer.memoryPracticeQuestion', 'question')
      .leftJoin('question.multipleChoiceQuestion', 'multipleChoice')
      .where('question.uid = :uid', { uid: eid })
      .andWhere('answer.timestamp = :timestamp', { timestamp: timestamp })
      .getRawMany()
      .catch(() => {
        throw new HttpException('Invalid timestamp format', HttpStatus.BAD_REQUEST);
      });

    if (questions.length === 0) {
      throw new HttpException('No record at this timestamp', HttpStatus.METHOD_NOT_ALLOWED);
    }
    questions.forEach((question) => {
      question['isMultipleChoice'] = question['isMultipleChoice'] === '1' ? true : false;
      question['isCorrect'] = question['isCorrect'] === '1' ? true : false;
    });

    const history = {
      timestamp,
      questions,
    };
    return history;
  }
}
