import { Injectable, HttpException, HttpStatus } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { UserService } from 'src/user/user.service';
import { Repository, Timestamp, getManager } from 'typeorm';
import { MemoryPracticeQuestionSetDto, multipleChoiceQuestion, createElderlyAnswersDto } from './dto/memory-practice.dto'
import { MultipleChoiceQuestion as McqInterface, MemoryPracticeQuestion as MemoryPracticeQuestionInterface, MemoryPracticeQuestionSet} from './memory-practice.interface'

@Injectable()
export class MemoryPracticeService {
    constructor(
        @InjectRepository(MemoryPracticeQuestion)
        private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
        @InjectRepository(MemoryPracticeAnswer)
        private memoryPracticeAnswerRepository: Repository<MemoryPracticeAnswer>,
        // @InjectRepository(MultipleChoiceQuestion)
        // private multipleChoiceQuestionRepository: Repository<MultipleChoiceQuestion>,
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

    async createElderlyAnswers(eid: number, elderlyAnswers: createElderlyAnswersDto){
        const timestamp = new Date()
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
                throw new HttpException('This question does not belong to this elderly', HttpStatus.FORBIDDEN)
            }
            const memoryPracticeAnswer = new MemoryPracticeAnswer();
            memoryPracticeAnswer.memoryPracticeQuestion = memoryPracticeQuestion;
            memoryPracticeAnswer.elderAnswer = answer['answer'];
            memoryPracticeAnswer.timestamp = timestamp;
            await this.memoryPracticeAnswerRepository.save(memoryPracticeAnswer);
        }
        return {message: "Elderly answers are successfully recorded"};
    }
    
    async getHistory(eid: number, cid: number, limit: number=10, offset:number=0){
        await this.userService.checkRelationship(eid, cid);

        const history = await this.memoryPracticeAnswerRepository.createQueryBuilder("answer")
            .select("DATE_FORMAT(answer.timestamp, '%Y-%m-%d %H:%i:%S.%f')", 'timestamp')
            // .addSelect("COUNT(answer.mid)", "totalCount")
            // .addSelect(subQuery => {
            //     return subQuery
            //         .select("COUNT(answer2.mid)")
            //         .from(MemoryPracticeAnswer, "answer2")
            //         .leftJoin("answer2.memoryPracticeQuestion", "question2")
            //         .leftJoin("question2.multipleChoiceQuestion", "multipleChoice2")
            //         .where("(answer2.elderAnswer = multipleChoice2.correctAnswer OR multipleChoice2.correctAnswer IS NULL) AND question2.uid = :uid AND answer2.timestamp = answer.timestamp", {uid:eid})
            // }, "correctCount")
            .innerJoin("answer.memoryPracticeQuestion", "question")
            .leftJoin("question.multipleChoiceQuestion", "multipleChoice")
            .where("question.uid = :uid", {uid:eid})
            .groupBy("answer.timestamp")
            .orderBy("answer.timestamp", "DESC")
            .limit(limit)
            .offset(offset)
            .getRawMany()
        console.log(history)
        return history;
    }

    async getHistoryByTimestamp(eid: number, cid: number, timestamp: string){
        const questions = await this.memoryPracticeAnswerRepository.createQueryBuilder("answer")
            .select("answer.mid", "mid")
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
            .getRawMany();
        if(questions.length===0){
            throw new HttpException('No record at this timestamp', HttpStatus.BAD_REQUEST);
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
