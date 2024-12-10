import {
  BadRequestException,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Query,
} from '@nestjs/common';
import { TagsService } from './tags.service';
import {
  ApiBadRequestResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { Tag } from './entities/tag.entity';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { Permissions } from '../iam/authorization/decorators/permissions.decorator';
import { TagsPermission } from './tags.permission';

@ApiBadRequestResponse({
  description: 'Error: Bad Request',
  example: new BadRequestException(
    'Field/s must exist or it is invalid',
  ).getResponse(),
})
@ApiTags('tags')
@Controller('tags')
export class TagsController {
  constructor(private readonly tagsService: TagsService) {}

  @ApiOkResponse({
    type: [Tag],
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Get all tags' })
  @Get()
  findAll(
    @Query() paginationQuery: PaginationQueryDto,
  ): Promise<PaginationPageDto<Tag>> {
    return this.tagsService.getTags(paginationQuery);
  }

  @ApiOkResponse({
    type: Tag,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'Tag with this name not found',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Remove tag by name' })
  @Permissions(TagsPermission.DeleteTag)
  @Delete(':name')
  remove(@Param('name') name: string): Promise<Tag> {
    return this.tagsService.remove(name);
  }
}
