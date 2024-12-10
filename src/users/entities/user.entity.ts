import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import {
  AddBase,
  AddDatesColumn,
  AddIdColumn,
} from '../../common/mixins/add-general-columns.mixin';
import { Role } from '../../iam/authorization/entities/role.entity';

@Entity('users')
export class User extends AddIdColumn(AddDatesColumn(AddBase())) {
  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @JoinTable({
    name: 'user_role',
    joinColumn: {
      name: 'user_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => Role, { eager: true })
  roles: Role[];
}
