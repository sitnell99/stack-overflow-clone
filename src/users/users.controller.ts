import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  NotFoundException,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Auth } from '../iam/authentication/decorators/auth.decorator';
import { AuthType } from '../iam/authentication/enums/auth-type.enum';
import { User } from './entities/user.entity';
import {
  ApiBadRequestResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { Permissions } from '../iam/authorization/decorators/permissions.decorator';
import { UsersPermission } from './users.permission';

@ApiBadRequestResponse({
  description: 'Error: Bad Request',
  example: new BadRequestException(
    'Field/s must exist or it is invalid',
  ).getResponse(),
})
@ApiTags('users')
@Auth(AuthType.None)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @ApiCreatedResponse({
    type: User,
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Create user' })
  @Permissions(UsersPermission.CreateUser)
  @Post()
  create(@Body() createUserDto: CreateUserDto): Promise<User> {
    return this.usersService.create(createUserDto);
  }

  @ApiOkResponse({
    type: [User],
    description: 'Successful',
  })
  @ApiOperation({ summary: 'Get all users' })
  @Get()
  findAll(
    @Query() paginationAndSortQuery: PaginationAndSortQueryDto,
  ): Promise<PaginationPageDto<User>> {
    return this.usersService.getUsers(paginationAndSortQuery);
  }

  @ApiOkResponse({
    type: User,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('User with this id not found').getResponse(),
  })
  @ApiOperation({ summary: 'Get user by id' })
  @Get(':id')
  findOne(@Param('id') id: number): Promise<User> {
    return this.usersService.findOne(id);
  }

  @ApiOkResponse({
    type: User,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('User with this id not found').getResponse(),
  })
  @ApiOperation({ summary: 'Update user' })
  @Permissions(UsersPermission.UpdateUser)
  @Patch(':id')
  update(
    @Param('id') id: number,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
    return this.usersService.update(id, updateUserDto);
  }

  @ApiOkResponse({
    type: User,
    description: 'Successful',
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('User with this id not found').getResponse(),
  })
  @ApiOperation({ summary: 'Remove user' })
  @Permissions(UsersPermission.DeleteUser)
  @Delete(':id')
  remove(@Param('id') id: number): Promise<User> {
    return this.usersService.remove(id);
  }
}
