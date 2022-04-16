import { ApiProperty } from "@nestjs/swagger";
import { IsBoolean, IsNumber, IsObject, IsOptional, IsString } from "class-validator";

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