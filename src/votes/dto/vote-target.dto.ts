import { IsOptional } from 'class-validator';

export class VoteTargetDto {
  @IsOptional()
  questionId?: number;

  @IsOptional()
  answerId?: number;
}
