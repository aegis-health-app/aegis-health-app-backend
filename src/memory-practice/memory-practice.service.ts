import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MemoryPracticeQuestionSetDto, CreateElderlyAnswersDto, GetHistoryDto, GetHistoryByTimestampDto} from './dto/memory-practice.dto'
import { MultipleChoiceQuestion as McqInterface, MemoryPracticeQuestion as MemoryPracticeQuestionInterface, MemoryPracticeQuestionSet} from './memory-practice.interface'

@Injectable()
export class MemoryPracticeService {
    constructor(
        @InjectRepository(MemoryPracticeQuestion)
        private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
        @InjectRepository(MemoryPracticeAnswer)
        private memoryPracticeAnswerRepository: Repository<MemoryPracticeAnswer>,
        private userService: UserService
    ) {}
    
    async getQuestionSet(eid: number): Promise<MemoryPracticeQuestionSetDto>{
        const questions = await this.memoryPracticeQuestionRepository
            .createQueryBuilder("question")
            .leftJoinAndSelect("question.users", "user")
            .leftJoinAndSelect("question.multipleChoiceQuestion", "multipleChoices")
            .where("user.uid = :uid", {uid: eid})
            .andWhere("question.isSelected = :isSelected", {isSelected: true})
            .getMany();
        
        let questionSet: MemoryPracticeQuestionSet = {
            questions: []
        }
        for (let q of questions){
            let multipleChoiceQuestion: McqInterface;
            if(q['multipleChoiceQuestion']!==null){
                multipleChoiceQuestion = {
                    choice1: q['multipleChoiceQuestion']['choice1'],
                    choice2: q['multipleChoiceQuestion']['choice2'],
                    choice3: q['multipleChoiceQuestion']['choice3'],
                    choice4: q['multipleChoiceQuestion']['choice4'],
                    correctAnswer: q['multipleChoiceQuestion']['correctAnswer']
                }
            } else{
                multipleChoiceQuestion = null;
            }

            let question: MemoryPracticeQuestionInterface = {
                mid: +q['mid'],
                question: q['question'],
                imageid: q['imageid'],
                multipleChoiceQuestion: multipleChoiceQuestion,
                isMultipleChoice: q['multipleChoiceQuestion']!==null? true:false
            }
            questionSet['questions'].push(question);
        }
        return questionSet;
    }

    async createElderlyAnswers(eid: number, elderlyAnswers: CreateElderlyAnswersDto): Promise<{message: string}>{
        const timestamp = new Date();
        console.log(elderlyAnswers)
        const answers = elderlyAnswers['answers'];
        for (const answer of answers){
            const memoryPracticeQuestion = await this.memoryPracticeQuestionRepository.findOne({ 
                where:{
                    mid: answer['mid']
                }, 
                relations: ["users"]
            })
            if(!memoryPracticeQuestion){
                throw new HttpException('This question does not exist', HttpStatus.BAD_REQUEST)
            }
            if(memoryPracticeQuestion.users.uid !== eid){
                throw new HttpException('This question does not belong to this elderly', HttpStatus.NOT_ACCEPTABLE)
            }
            const memoryPracticeAnswer = new MemoryPracticeAnswer();
            memoryPracticeAnswer.memoryPracticeQuestion = memoryPracticeQuestion;
            memoryPracticeAnswer.elderAnswer = answer['answer'];
            memoryPracticeAnswer.timestamp = timestamp;
            await this.memoryPracticeAnswerRepository.save(memoryPracticeAnswer);
        }
        return {message: "Elderly answers are successfully recorded"};
    }
    
    async getHistory(eid: number, cid: number, limit: number=10, offset:number=0): Promise<GetHistoryDto>{
        await this.userService.checkRelationship(eid, cid);
        const records = await this.memoryPracticeAnswerRepository.createQueryBuilder("answer")
            .select("DATE_FORMAT(answer.timestamp, '%Y-%m-%d %H:%i:%S.%f')", 'timestamp')
            .innerJoin("answer.memoryPracticeQuestion", "question")
            .leftJoin("question.multipleChoiceQuestion", "multipleChoice")
            .where("question.uid = :uid", {uid:eid})
            .groupBy("answer.timestamp")
            .orderBy("answer.timestamp", "DESC")
            .limit(limit)
            .offset(offset)
            .getRawMany()
        let timestamps = []
        for (const record of records){
            timestamps.push(record['timestamp']);
        }
        const history = {
            timestamps
        }
        return history;
    }

    async getHistoryByTimestamp(eid: number, cid: number, timestamp: string): Promise<GetHistoryByTimestampDto>{
        await this.userService.checkRelationship(eid, cid);
    
        const questions = await this.memoryPracticeAnswerRepository.createQueryBuilder("answer")
        .select("answer.mid", "mid")
        .addSelect("DATE_FORMAT(answer.timestamp, '%Y-%m-%d %H:%i:%S.%f')", 'timestamp')
        .addSelect("question.imageid", "imageUrl")
        .addSelect("question.question", "question")
        .addSelect("multipleChoice.choice1 IS NOT NULL", "isMultipleChoice")
        .addSelect("answer.elderAnswer = multipleChoice.correctAnswer OR multipleChoice.correctAnswer IS NULL", "isCorrect")
        .addSelect("multipleChoice.choice1", "choice1")
        .addSelect("multipleChoice.choice2", "choice2")
        .addSelect("multipleChoice.choice3", "choice3")
        .addSelect("multipleChoice.choice4", "choice4")
        .addSelect("multipleChoice.correctAnswer", "correctAnswer")
        .addSelect("answer.elderAnswer", "elderlyAnswer")
        .leftJoin("answer.memoryPracticeQuestion", "question")
        .leftJoin("question.multipleChoiceQuestion", "multipleChoice")
        .where("question.uid = :uid", {uid:eid})
        .andWhere('answer.timestamp = :timestamp', {timestamp: timestamp})
        .getRawMany()
        .catch(()=> {
            throw new HttpException('Invalid timestamp format', HttpStatus.BAD_REQUEST)
        });
        
        if(questions.length===0){
            throw new HttpException('No record at this timestamp', HttpStatus.METHOD_NOT_ALLOWED);
        }
        questions.forEach(question=> {
            question['isMultipleChoice'] = question['isMultipleChoice']==='1'? true:false;
            question['isCorrect'] = question['isCorrect']==='1'? true:false;
        })
        
        const history = {
            timestamp,
            questions
        }
        return history;
    }
}
