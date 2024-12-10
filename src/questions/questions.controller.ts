import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  Delete,
  ForbiddenException,
  Get,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { QuestionsService } from './questions.service';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiForbiddenResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { ActiveUser } from '../iam/decorators/active-user.decorator';
import { Question } from './entities/question.entity';
import { ResponseMessage } from '../common/interfaces/response-message.interface';
import { QuestionExample } from './api-result-examples/question.example';
import { VoteValueDto } from '../votes/dto/vote-value.dto';
import { VotesService } from '../votes/votes.service';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { Permissions } from '../iam/authorization/decorators/permissions.decorator';
import { QuestionsPermission } from './questions.permission';
import { TagsPermission } from '../tags/tags.permission';

@ApiBadRequestResponse({
  description: 'Error: Bad Request',
  example: new BadRequestException(
    'Field/s must exist or it is invalid',
  ).getResponse(),
})
@ApiTags('questions')
@Controller('questions')
export class QuestionsController {
  constructor(
    private readonly questionsService: QuestionsService,
    private readonly votesService: VotesService,
  ) {}

  @ApiCreatedResponse({
    example: QuestionExample,
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Create question' })
  @ApiCookieAuth()
  @Permissions(QuestionsPermission.CreateQuestion, TagsPermission.CreateTag)
  @Post()
  create(
    @ActiveUser('sub') userId: number,
    @Body() createQuestionDto: CreateQuestionDto,
  ): Promise<Question> {
    return this.questionsService.create(createQuestionDto, userId);
  }

  @ApiOkResponse({
    example: [QuestionExample],
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Find all questions' })
  @Auth(AuthType.None)
  @Get('all')
  findAll(
    @Query() paginationAndSortQuery: PaginationAndSortQueryDto,
  ): Promise<PaginationPageDto<Question>> {
    return this.questionsService.getQuestions(paginationAndSortQuery);
  }

  @ApiOkResponse({
    example: [QuestionExample],
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Find current user questions' })
  @ApiCookieAuth()
  @Get('mine')
  findMine(
    @ActiveUser('sub') userId: number,
    @Query() paginationAndSortQuery: PaginationAndSortQueryDto,
  ): Promise<PaginationPageDto<Question>> {
    return this.questionsService.getQuestions(paginationAndSortQuery, {
      userId,
    });
  }

  @ApiOkResponse({
    example: QuestionExample,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question with this id not found',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Find question by id' })
  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Question> {
    return this.questionsService.findOne(id);
  }

  @ApiOkResponse({
    example: QuestionExample,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question with this id not found',
    ).getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can update this question!',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Update question' })
  @ApiCookieAuth()
  @Permissions(QuestionsPermission.UpdateQuestion, TagsPermission.CreateTag)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
    @Body() updateQuestionDto: UpdateQuestionDto,
  ): Promise<Question> {
    return this.questionsService.update(id, userId, updateQuestionDto);
  }

  @ApiOkResponse({
    type: Question,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question with this id not found',
    ).getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can update this question!',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Remove question' })
  @ApiCookieAuth()
  @Permissions(QuestionsPermission.DeleteQuestion, TagsPermission.DeleteTag)
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
  ): Promise<Question> {
    return this.questionsService.remove(id, userId);
  }

  @ApiOkResponse({
    description: 'Successful',
    example: { message: 'Answer was marked as accepted' },
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can accept the answer!',
    ).getResponse(),
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question does not have answer with this id',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Accept answer' })
  @ApiCookieAuth()
  @Permissions(QuestionsPermission.AcceptAnswer)
  @Patch(':id/accept-answer/:answer_id')
  acceptAnswer(
    @Param('id') id: number,
    @Param('answer_id') answerId: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    return this.questionsService.acceptAnswer(id, answerId, userId);
  }

  @ApiOkResponse({
    description: 'Successful',
    example: { message: 'Acceptance was revoked.' },
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can revoke accepted answer!',
    ).getResponse(),
  })
  @ApiConflictResponse({
    description: 'Error: Conflict',
    example: new ConflictException(
      'Question has no accepted answer!',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Revoke accepted answer' })
  @ApiCookieAuth()
  @Permissions(QuestionsPermission.RevokeAcceptedAnswer)
  @Patch(':id/revoke-accepted-answer')
  revokeAcceptedAnswer(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    return this.questionsService.revokeAcceptedAnswer(id, userId);
  }

  @ApiCreatedResponse({
    description: 'Successful',
    example: { message: 'Your vote has been counted' },
  })
  @ApiConflictResponse({
    description: 'Error: Conflict',
    example: new ConflictException('You have already voted').getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      "You can't vote for your own question",
    ).getResponse(),
  })
  @Permissions(QuestionsPermission.VoteQuestion)
  @Post('vote/:question_id')
  @ApiOperation({ summary: 'Vote for question' })
  async vote(
    @Body() voteValueDto: VoteValueDto,
    @Param('question_id') questionId: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    await this.questionsService.authorIdCheck(userId, questionId);
    return this.votesService.createOrUpdate(
      { ...voteValueDto, questionId },
      userId,
    );
  }

  @ApiOkResponse({
    description: 'Successful',
    example: { message: 'Your vote was revoked successfully' },
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('You are not voted yet').getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      "You can't vote for your own question",
    ).getResponse(),
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke question's vote" })
  @Permissions(QuestionsPermission.RevokeVoteQuestion)
  @Post('revoke-vote/:question_id')
  async voteRevoke(
    @Param('question_id') questionId: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    await this.questionsService.authorIdCheck(userId, questionId);
    return this.votesService.revoke({ questionId }, userId);
  }
}
