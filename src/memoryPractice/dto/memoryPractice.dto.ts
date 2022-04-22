import { ApiProperty } from "@nestjs/swagger";
import { IsArray, IsBoolean, IsNumber, IsObject, IsOptional, IsString, ValidateNested } from "class-validator";
import { Type } from "class-transformer";

export class Question {
  @ApiProperty()
  @IsString()
  mid: string;
  @ApiProperty()
  @IsString()
  question: string;
  @ApiProperty()
  @IsBoolean()
  isSelected: boolean;
  @ApiProperty()
  @IsString()
  imageid: string;
  @ApiProperty()
  @IsNumber()
  uid: number;
}

export class AllQuestionsCaretakerDto {
  @ApiProperty({ type: [Question] })
  @IsArray()
  questions: Question[];
}

export class QuestionDetailsDto {
  @ApiProperty()
  @IsString()
  question: string;
  @ApiProperty()
  @IsString()
  imageid: string;
  @ApiProperty()
  @IsBoolean()
  isMCQ: boolean;
  @ApiProperty()
  @IsString()
  @IsOptional()
  choice1?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  choice2?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  choice3?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  choice4?: string;
  @ApiProperty()
  @IsString()
  @IsOptional()
  correctAnswer?: string;
}

export class ElderlyWithCaretakerDto {
  @ApiProperty()
  @IsNumber()
  elderlyuid: number
}

export class SelectQuestionDto extends ElderlyWithCaretakerDto {
  @ApiProperty()
  @IsNumber()
  mid: number
}

export class UploadImageDto {
  @ApiProperty()
  @IsString()
  base64: string;
  @ApiProperty()
  @IsString()
  name: string;
  @ApiProperty()
  @IsString()
  type: string;
  @ApiProperty()
  @IsNumber()
  size: number;
}

export class CreateQuestionDto extends ElderlyWithCaretakerDto {
  @ApiProperty()
  @IsString()
  question: string
  @ApiProperty({ type: UploadImageDto })
  @IsOptional()
  @IsObject()
  image?: UploadImageDto
  @ApiProperty()
  @IsBoolean()
  isMCQ: boolean
  @ApiProperty()
  @IsOptional()
  @IsString()
  choice1?: string
  @ApiProperty()
  @IsOptional()
  @IsString()
  choice2?: string
  @ApiProperty()
  @IsOptional()
  @IsString()
  choice3?: string
  @ApiProperty()
  @IsOptional()
  @IsString()
  choice4?: string
  @ApiProperty()
  @IsOptional()
  @IsString()
  correctAnswer?: string
}

export class EditQuestionDto extends CreateQuestionDto {
  @ApiProperty()
  @IsString()
  mid: string
}

export class DeleteQuestionDto extends ElderlyWithCaretakerDto {
  @ApiProperty()
  @IsString()
  mid: string
}

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
  imageid?: string;

  @ApiProperty({ type: multipleChoiceQuestion })
  @IsOptional()
  multipleChoiceQuestion?: multipleChoiceQuestion;

  @ApiProperty()
  @IsBoolean()
  isMultipleChoice: boolean;
}

export class MemoryPracticeQuestionSetDto{
  @ApiProperty({ type: [MemoryPracticeQuestion]})
  @IsArray()
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
  @IsArray()
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
