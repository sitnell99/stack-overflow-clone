import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import {
  AddBase,
  AddIdColumn,
} from '../../../common/mixins/add-general-columns.mixin';
import { Permission } from './permission.entity';

@Entity('roles')
export class Role extends AddIdColumn(AddBase()) {
  @Column({ unique: true })
  name: string;

  @JoinTable({
    name: 'role_permission',
    joinColumn: {
      name: 'role_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'permission_id',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => Permission, { eager: true })
  permissions: Permission[];
}
