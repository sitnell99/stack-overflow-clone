import { Injectable, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { In, Repository } from 'typeorm';
import { PaginationPageDto } from '../common/dto/pagination-page.dto';
import { defineSortByOption } from '../common/utils/define-sort-by-option';
import { PaginationOptionsDto } from '../common/dto/pagination-options.dto';
import { PaginationAndSortQueryDto } from '../common/dto/pagination-and-sort-query.dto';
import { Roles } from '../iam/authorization/enums/role.enum';
import { Role } from '../iam/authorization/entities/role.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}

  create(createUserDto: CreateUserDto): Promise<User> {
    const user = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(user);
  }

  async getUsers(
    paginationAndSortQuery: PaginationAndSortQueryDto,
  ): Promise<PaginationPageDto<User>> {
    const [users, totalItems] = await this.usersRepository.findAndCount({
      skip: paginationAndSortQuery.skip,
      take: paginationAndSortQuery.perPage,
      order: {
        [`${defineSortByOption(paginationAndSortQuery.sortBy)}`]:
          paginationAndSortQuery.sortOrder,
      },
    });

    const paginationOptions = new PaginationOptionsDto({
      totalItems,
      paginationQuery: paginationAndSortQuery,
    });

    return new PaginationPageDto(users, paginationOptions);
  }

  async findOne(id: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id },
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return user;
  }

  async update(id: number, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.usersRepository.preload({
      id,
      ...updateUserDto,
    });
    if (!user) {
      throw new NotFoundException(`User with id ${id} not found`);
    }
    return this.usersRepository.save(user);
  }

  async remove(id: number): Promise<User> {
    const user = await this.findOne(id);
    return this.usersRepository.remove(user);
  }

  private async findRoles(roleNames: string[]): Promise<Role[]> {
    const roles = await this.rolesRepository.find({
      where: [
        {
          name: In(roleNames),
        },
      ],
    });
    if (!roles) {
      throw new NotFoundException('Role does not exist');
    }
    return roles;
  }

  async updateToProUser(userId: number): Promise<User> {
    const user = await this.findOne(userId);
    const userRoles = user.roles.map((role) => role.name);

    if (userRoles.includes(Roles.PRO_USER)) {
      return user;
    }

    const roles = await this.findRoles([Roles.USER, Roles.PRO_USER]);

    return await this.update(userId, { roles });
  }
}
