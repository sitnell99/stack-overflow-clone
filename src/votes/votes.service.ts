import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateOrUpdateVoteDto } from './dto/create-or-update-vote.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Vote } from './entities/vote.entity';
import { Repository } from 'typeorm';
import { ResponseMessage } from '../common/interfaces/response-message.interface';
import { VoteTargetDto } from './dto/vote-target.dto';

@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly votesRepository: Repository<Vote>,
  ) {}

  async createOrUpdate(
    createOrUpdateVoteDto: CreateOrUpdateVoteDto,
    userId: number,
  ) {
    try {
      const { isUpvote, ...ids } = createOrUpdateVoteDto;

      const existingVote = await this.votesRepository.findOne({
        where: {
          ...ids,
          userId,
        },
      });

      if (existingVote) {
        return this.changeVote(existingVote, isUpvote);
      }

      const vote = this.votesRepository.create({
        ...createOrUpdateVoteDto,
        userId,
      });

      await this.votesRepository.save(vote);

      return {
        message: 'Your vote has been counted',
      };
    } catch (error) {
      console.error(error);
      if (error.status === 409) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to vote, please try again later',
      );
    }
  }

  private async changeVote(
    existingVote: Vote,
    isUpvote: boolean,
  ): Promise<ResponseMessage> {
    if (isUpvote === existingVote.isUpvote) {
      throw new ConflictException('You have already voted');
    }

    existingVote.isUpvote = isUpvote;
    await this.votesRepository.save(existingVote);

    return {
      message: 'Your vote was changed successfully',
    };
  }

  async revoke(
    voteTargetDto: VoteTargetDto,
    userId: number,
  ): Promise<ResponseMessage> {
    try {
      const vote = await this.votesRepository.findOne({
        where: {
          ...voteTargetDto,
          userId,
        },
      });

      if (!vote) {
        throw new NotFoundException('You are not voted yet');
      }

      await this.votesRepository.remove(vote);
      return {
        message: 'Your vote was revoked successfully',
      };
    } catch (error) {
      console.error(error);

      if (error.status === 404) {
        throw error;
      }

      throw new InternalServerErrorException(
        'Failed to revoke vote, please try again later',
      );
    }
  }
}
