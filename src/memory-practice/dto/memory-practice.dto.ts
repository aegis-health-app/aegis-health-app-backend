import { ApiProperty } from "@nestjs/swagger";
import { Type } from "class-transformer";
import { IsNumber, IsString, IsDate, IsOptional, IsBoolean, IsNotEmpty, ValidateNested } from "class-validator";
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
    @ValidateNested()
    @Type(() => ElderlyAnswer)
    answers: ElderlyAnswer[]
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
    @IsOptional()
    imageUrl?: string

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
    @IsOptional()
    choice1?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    choice2?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    choice3?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    choice4?: string

    @ApiProperty()
    @IsString()
    @IsOptional()
    correctAnswer?: string

    @ApiProperty()
    @IsString()
    elderlyAnswer: string
}

export class GetHistoryByTimestampDto{
    @ApiProperty()
    @IsString()
    timestamp: string;

    @ApiProperty({ type: [QuestionAnswer]})
    @ValidateNested()
    @Type(() => QuestionAnswer)
    questions: Array<QuestionAnswer>


}
