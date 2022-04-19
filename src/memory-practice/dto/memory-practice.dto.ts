import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsDate, IsOptional, IsBoolean, IsNotEmpty } from "class-validator";
import { Timestamp } from "firebase-admin/firestore";

export class multipleChoiceQuestion{
    @ApiProperty()
    @IsString()
    choice1: string;

    @ApiProperty()
    @IsString()
    choice2: string;

    @ApiProperty()
    @IsString()
    choice3: string;

    @ApiProperty()
    @IsString()
    choice4: string;

    @ApiProperty()
    @IsString()
    correctAnswer: string;
}
export class MemoryPracticeQuestion{
    @ApiProperty()
    @IsNumber()
    mid: number;

    @ApiProperty()
    @IsString()
    question: string;

    @ApiProperty()
    @IsString()
    @IsOptional()
    imageid: string;

    @ApiProperty()
    @IsOptional()
    multipleChoiceQuestion: multipleChoiceQuestion;

    @ApiProperty()
    @IsBoolean()
    isMultipleChoice: boolean;
}

export class MemoryPracticeQuestionSetDto{
    @ApiProperty({ type: [MemoryPracticeQuestion]})
    questions: Array<MemoryPracticeQuestion>
}


export class ElderlyAnswer{
    @ApiProperty()
    @IsNumber()
    mid: number;

    @ApiProperty()
    @IsString()
    answer: string;
}

export class CreateElderlyAnswersDto{
    @ApiProperty({ type: [ElderlyAnswer]})
    answers: Array<ElderlyAnswer>
}

export class GetHistoryDto{
    @ApiProperty({ type: [String]})
    timestamps: string[];
}

export class QuestionAnswer{
    @ApiProperty()
    @IsNumber()
    mid: number

    @ApiProperty()
    @IsString()
    imageUrl: string

    @ApiProperty()
    @IsString()
    question: string

    @ApiProperty()
    @IsBoolean()
    isMultipleChoice: boolean

    @ApiProperty()
    @IsBoolean()
    isCorrect: boolean

    @ApiProperty()
    @IsString()
    choice1: string

    @ApiProperty()
    @IsString()
    choice2: string

    @ApiProperty()
    @IsString()
    choice3: string

    @ApiProperty()
    @IsString()
    choice4: string

    @ApiProperty()
    @IsString()
    correctAnswer: string

    @ApiProperty()
    @IsString()
    elderlyAnswer: string
}

export class GetHistoryByTimestampDto{
    @ApiProperty()
    @IsString()
    timestamp: string;

    @ApiProperty({ type: [QuestionAnswer]})
    questions: Array<QuestionAnswer>


}
