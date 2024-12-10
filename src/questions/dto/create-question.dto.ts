import { IsString } from 'class-validator';

export class CreateQuestionDto {
  @IsString()
  title: string;

  @IsString()
  body: string;

  @IsString({ each: true })
  tags: string[];
}
