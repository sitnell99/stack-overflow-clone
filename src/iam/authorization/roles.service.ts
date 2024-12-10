import { InjectRepository } from '@nestjs/typeorm';
import { Role } from './entities/role.entity';
import { Repository } from 'typeorm';
import { NotFoundException } from '@nestjs/common';

export class RolesService {
  constructor(
    @InjectRepository(Role)
    private readonly rolesRepository: Repository<Role>,
  ) {}
  async findOneByName(name: string): Promise<Role> {
    const role = await this.rolesRepository.findOne({
      where: { name },
    });
    if (!role) {
      throw new NotFoundException('Role does not exist');
    }
    return role;
  }
}
