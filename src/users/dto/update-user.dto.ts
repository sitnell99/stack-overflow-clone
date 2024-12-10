import { PartialType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';
import { Role } from '../../iam/authorization/entities/role.entity';

export class UpdateUserDto extends PartialType(CreateUserDto) {
  roles: Role[];
}
