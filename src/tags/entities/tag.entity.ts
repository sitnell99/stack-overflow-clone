import { Column, Entity } from 'typeorm';
import {
  AddBase,
  AddIdColumn,
} from '../../common/mixins/add-general-columns.mixin';

@Entity('tags')
export class Tag extends AddIdColumn(AddBase()) {
  @Column({ unique: true })
  name: string;
}
