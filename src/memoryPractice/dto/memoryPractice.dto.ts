import { ApiProperty } from "@nestjs/swagger";
import { IsNumber } from "class-validator";

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

export class CreateQuestionDto extends ElderlyWithCaretakerDto {
  @ApiProperty()
  @IsNumber()
  mid: number

}