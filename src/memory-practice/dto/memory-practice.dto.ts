import { ApiProperty } from "@nestjs/swagger";
import { IsNumber, IsString, IsDate, IsOptional, IsBoolean, IsNotEmpty } from "class-validator";

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

export class createElderlyAnswersDto{
    @ApiProperty({ type: [ElderlyAnswer]})
    answers: Array<ElderlyAnswer>
}

