import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  HttpCode,
  HttpStatus,
  ConflictException,
  Query,
} from '@nestjs/common';
import { AnswersService } from './answers.service';
import { CreateAnswerDto } from './dto/create-answer.dto';
import { UpdateAnswerDto } from './dto/update-answer.dto';
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
import { Answer } from './entities/answer.entity';
import { Auth } from 'src/iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { VoteValueDto } from '../votes/dto/vote-value.dto';
import { VotesService } from '../votes/votes.service';
import { ResponseMessage } from '../common/interfaces/response-message.interface';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { Permissions } from '../iam/authorization/decorators/permissions.decorator';
import { AnswersPermission } from './answers.permission';

@ApiBadRequestResponse({
  description: 'Error: Bad Request',
  example: new BadRequestException(
    'Field/s must exist or it is invalid',
  ).getResponse(),
})
@ApiTags('answers')
@Controller('answers')
export class AnswersController {
  constructor(
    private readonly answersService: AnswersService,
    private readonly votesService: VotesService,
  ) {}

  @ApiCreatedResponse({
    type: Answer,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question with this id not found',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Create answer' })
  @ApiCookieAuth()
  @Permissions(AnswersPermission.CreateAnswer)
  @Post(':question_id')
  create(
    @Param('question_id') id: number,
    @ActiveUser('sub') userId: number,
    @Body() createAnswerDto: CreateAnswerDto,
  ): Promise<Answer> {
    return this.answersService.create(createAnswerDto, id, userId);
  }

  @ApiOkResponse({
    type: Answer,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Answer with this id not found',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Get single answer by id' })
  @Auth(AuthType.None)
  @Get(':id')
  findOne(@Param('id') id: number): Promise<Answer> {
    return this.answersService.findOne(id);
  }

  @ApiOkResponse({
    type: [Answer],
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Question with this id not found',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Get all answers for question' })
  @Auth(AuthType.None)
  @Get('list/:question_id')
  getAnswersList(
    @Param('question_id') questionId: number,
    @Query() paginationAndSortQuery: PaginationAndSortQueryDto,
  ): Promise<PaginationPageDto<Answer>> {
    return this.answersService.getAnswers(paginationAndSortQuery, questionId);
  }

  @ApiOkResponse({
    type: Answer,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Answer with this id not found',
    ).getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can update this answer!',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Update answer body' })
  @ApiCookieAuth()
  @Permissions(AnswersPermission.UpdateAnswer)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
    @Body() updateAnswerDto: UpdateAnswerDto,
  ): Promise<Answer> {
    return this.answersService.update(id, userId, updateAnswerDto);
  }

  @ApiOkResponse({
    type: Answer,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Answer with this id not found',
    ).getResponse(),
  })
  @ApiForbiddenResponse({
    description: 'Error: Forbidden',
    example: new ForbiddenException(
      'Only author can remove this answer!',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Remove answer' })
  @ApiCookieAuth()
  @Permissions(AnswersPermission.DeleteAnswer)
  @Delete(':id')
  remove(
    @Param('id') id: number,
    @ActiveUser('sub') userId: number,
  ): Promise<Answer> {
    return this.answersService.remove(id, userId);
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
      "You can't vote for your own answer",
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Vote for answer' })
  @Permissions(AnswersPermission.VoteAnswer)
  @Post('vote/:answer_id')
  async vote(
    @Body() voteValueDto: VoteValueDto,
    @Param('answer_id') answerId: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    await this.answersService.authorIdCheck(userId, answerId);
    return this.votesService.createOrUpdate(
      { ...voteValueDto, answerId },
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
      "You can't vote for your own answer",
    ).getResponse(),
  })
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: "Revoke answer's vote" })
  @Permissions(AnswersPermission.RevokeVoteAnswer)
  @Post('revoke-vote/:answer_id')
  async voteRevoke(
    @Param('answer_id') answerId: number,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    await this.answersService.authorIdCheck(userId, answerId);
    return this.votesService.revoke({ answerId }, userId);
  }
}
