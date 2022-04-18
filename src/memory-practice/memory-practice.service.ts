import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { MemoryPracticeAnswer } from 'src/entities/memoryPracticeAnswer.entity';
import { MemoryPracticeQuestion } from 'src/entities/memoryPracticeQuestion.entity';
import { MultipleChoiceQuestion } from 'src/entities/multipleChoiceQuestion.entity';
import { UserService } from 'src/user/user.service';
import { Repository } from 'typeorm';
import { MemoryPracticeQuestionSetDto, multipleChoiceQuestion,  } from './dto/memory-practice.dto'
import { MultipleChoiceQuestion as McqInterface, MemoryPracticeQuestion as MemoryPracticeQuestionInterface, MemoryPracticeQuestionSet} from './memory-practice.interface'


@Injectable()
export class MemoryPracticeService {
    constructor(
        @InjectRepository(MemoryPracticeQuestion)
        private memoryPracticeQuestionRepository: Repository<MemoryPracticeQuestion>,
        @InjectRepository(MemoryPracticeAnswer)
        private memoryPracticeAnswerRepository: Repository<MemoryPracticeAnswer>,
        @InjectRepository(MultipleChoiceQuestion)
        private multipleChoiceQuestionRepository: Repository<MultipleChoiceQuestion>,
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
        console.log(questionSet);
        return questionSet;
    }

    async createElderlyAnswers(eid: number){

    }


}
