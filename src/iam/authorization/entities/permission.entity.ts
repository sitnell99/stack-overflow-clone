import { Column, Entity } from 'typeorm';
import {
  AddBase,
  AddIdColumn,
} from '../../../common/mixins/add-general-columns.mixin';

@Entity('permissions')
export class Permission extends AddIdColumn(AddBase()) {
  @Column({ unique: true })
  name: string;
}
