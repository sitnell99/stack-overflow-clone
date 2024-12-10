import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
import { Repository } from 'typeorm';
import { Answer } from './entities/answer.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { QuestionsService } from '../questions/questions.service';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { defineSortByOption } from '../common/utils/define-sort-by-option';
import { UsersService } from '../users/users.service';

@Injectable()
export class AnswersService {
  constructor(
    @InjectRepository(Answer)
    private readonly answerRepository: Repository<Answer>,
    private readonly questionService: QuestionsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createAnswerDto: CreateAnswerDto,
    questionId: number,
    userId: number,
  ): Promise<Answer> {
    try {
      await this.questionService.findOne(questionId);

      const answer = this.answerRepository.create({
        ...createAnswerDto,
        questionId,
        userId,
      });

      await this.usersService.updateToProUser(userId);

      return await this.answerRepository.save(answer);
    } catch (error) {
      console.error(error);
      if (error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to create an answer. Please try again later',
      );
    }
  }

  async getAnswers(
    paginationAndSortQuery: PaginationAndSortQueryDto,
    questionId: number,
  ): Promise<PaginationPageDto<Answer>> {
    await this.questionService.findOne(questionId);

    const [answers, totalItems] = await this.answerRepository.findAndCount({
      skip: paginationAndSortQuery.skip,
      take: paginationAndSortQuery.perPage,
      order: {
        [`${defineSortByOption(paginationAndSortQuery.sortBy)}`]:
          paginationAndSortQuery.sortOrder,
      },
      where: {
        questionId,
      },
    });

    const paginationOptions = new PaginationOptionsDto({
      totalItems,
      paginationQuery: paginationAndSortQuery,
    });

    return new PaginationPageDto(answers, paginationOptions);
  }

  async findOne(id: number): Promise<Answer> {
    const answer = await this.answerRepository.findOne({
      where: { id },
    });
    if (!answer) {
      throw new NotFoundException(`Answer with id ${id} not found`);
    }
    return answer;
  }

  async update(
    id: number,
    userId: number,
    updateAnswerDto: UpdateAnswerDto,
  ): Promise<Answer> {
    try {
      const answer = await this.answerRepository.preload({
        id,
        ...updateAnswerDto,
      });
      if (!answer) {
        throw new NotFoundException(`Answer with id ${id} not found`);
      }
      if (userId !== answer.userId) {
        throw new ForbiddenException(`Only author can update this answer!`);
      }
      return this.answerRepository.save(answer);
    } catch (error) {
      console.error(error);
      if (error.status === 404 || error.status === 403) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update answer, please try again later.',
      );
    }
  }

  async remove(id: number, userId: number): Promise<Answer> {
    try {
      const answer = await this.findOne(id);
      if (userId !== answer.userId) {
        throw new ForbiddenException(`Only author can remove this answer!`);
      }
      return this.answerRepository.remove(answer);
    } catch (error) {
      console.error(error);
      if (error.status === 403 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove answer, please try again later.',
      );
    }
  }

  async authorIdCheck(userId: number, answerId: number): Promise<boolean> {
    const answer = await this.findOne(answerId);
    if (userId === answer.userId) {
      throw new ForbiddenException("You can't vote for your own answer");
    }

    return true;
  }
}
