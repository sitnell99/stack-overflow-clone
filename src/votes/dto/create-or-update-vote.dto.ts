import { IsBoolean, IsOptional } from 'class-validator';

export class CreateOrUpdateVoteDto {
  @IsBoolean()
  isUpvote: boolean;

  @IsOptional()
  questionId?: number;

  @IsOptional()
  answerId?: number;
}
