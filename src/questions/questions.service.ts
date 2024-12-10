import {
  ConflictException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, Repository } from 'typeorm';
import { Question } from './entities/question.entity';
import { ResponseMessage } from '../common/interfaces/response-message.interface';
import { Answer } from '../answers/entities/answer.entity';
import { TagsService } from '../tags/tags.service';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { defineSortByOption } from '../common/utils/define-sort-by-option';
import { UsersService } from '../users/users.service';

@Injectable()
export class QuestionsService {
  constructor(
    @InjectRepository(Question)
    private readonly questionRepository: Repository<Question>,
    private readonly tagsService: TagsService,
    private readonly usersService: UsersService,
  ) {}

  async create(
    createQuestionDto: CreateQuestionDto,
    userId: number,
  ): Promise<Question> {
    try {
      const tags = await this.tagsService.upsertAndFind(createQuestionDto.tags);

      const question = this.questionRepository.create({
        ...createQuestionDto,
        tags,
        userId,
      });

      await this.usersService.updateToProUser(userId);

      return this.questionRepository.save(question);
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create a question, please try again later',
      );
    }
  }

  async getQuestions(
    paginationAndSortQuery: PaginationAndSortQueryDto,
    findOptions?: FindOptionsWhere<Question>,
  ): Promise<PaginationPageDto<Question>> {
    const [questions, totalItems] = await this.questionRepository.findAndCount({
      skip: paginationAndSortQuery.skip,
      take: paginationAndSortQuery.perPage,
      order: {
        [`${defineSortByOption(paginationAndSortQuery.sortBy)}`]:
          paginationAndSortQuery.sortOrder,
      },
      where: {
        ...findOptions,
      },
    });

    const paginationOptions = new PaginationOptionsDto({
      totalItems,
      paginationQuery: paginationAndSortQuery,
    });

    return new PaginationPageDto(questions, paginationOptions);
  }

  async findOne(id: number, loadAnswers: boolean = false): Promise<Question> {
    const relations: string[] = [];

    if (loadAnswers) {
      relations.push('answers');
    }

    const question = await this.questionRepository.findOne({
      relations,
      where: { id },
    });
    if (!question) {
      throw new NotFoundException(`Question with id ${id} not found`);
    }
    return question;
  }

  async update(
    id: number,
    userId: number,
    updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    try {
      const tags = await this.tagsService.upsertAndFind(updateQuestionDto.tags);

      const question = await this.questionRepository.preload({
        id,
        ...updateQuestionDto,
        tags,
      });
      if (!question) {
        throw new NotFoundException(`Question with id ${id} not found`);
      }
      if (userId !== question.userId) {
        throw new ForbiddenException(`Only author can update question!`);
      }

      return this.questionRepository.save(question);
    } catch (error) {
      console.error(error);
      if (error.status === 404 || error.status === 403) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to update a question, please try again later.',
      );
    }
  }

  async remove(id: number, userId: number): Promise<Question> {
    try {
      const question = await this.findOne(id, true);
      if (userId !== question.userId) {
        throw new ForbiddenException(`Only author can remove question!`);
      }
      return this.questionRepository.remove(question);
    } catch (error) {
      console.error(error);
      if (error.status === 404 || error.status === 403) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to remove question, please try again later.',
      );
    }
  }

  private findCurrentAnswer(answers: Answer[], answerId: number): Answer {
    return answers.find((answer) => answer.id === answerId);
  }

  async acceptAnswer(
    id: number,
    answerId: number,
    userId: number,
  ): Promise<ResponseMessage> {
    try {
      const question = await this.findOne(id, true);
      const answer = this.findCurrentAnswer(question.answers, answerId);

      if (userId !== question.userId) {
        throw new ForbiddenException(`Only author can accept the answer!`);
      }
      if (!answer) {
        throw new NotFoundException(
          `Question does not have answer with id ${answerId}`,
        );
      }

      question.acceptedAnswerId = answerId;
      await this.questionRepository.save(question);

      return {
        message: 'Answer was marked as accepted',
      };
    } catch (error) {
      console.error(error);
      if (error.status === 403 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to accept the answer, please try again later.',
      );
    }
  }

  async revokeAcceptedAnswer(
    id: number,
    userId: number,
  ): Promise<ResponseMessage> {
    try {
      const question = await this.findOne(id);

      if (question.acceptedAnswerId === null) {
        throw new ConflictException(`Question has no accepted answer!`);
      }

      if (userId !== question.userId) {
        throw new ForbiddenException(`Only author can revoke accepted answer!`);
      }

      question.acceptedAnswerId = null;
      await this.questionRepository.save(question);

      return {
        message: 'Acceptance was revoked.',
      };
    } catch (error) {
      console.error(error);
      if (error.status === 403 || error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to accept the answer, please try again later.',
      );
    }
  }

  async authorIdCheck(userId: number, questionId: number): Promise<boolean> {
    const question = await this.findOne(questionId);
    if (userId === question.userId) {
      throw new ForbiddenException("You can't vote for your own question");
    }

    return true;
  }
}
