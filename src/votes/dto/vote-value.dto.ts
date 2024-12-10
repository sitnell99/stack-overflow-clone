import { IsBoolean } from 'class-validator';

export class VoteValueDto {
  @IsBoolean()
  isUpvote: boolean;
}
