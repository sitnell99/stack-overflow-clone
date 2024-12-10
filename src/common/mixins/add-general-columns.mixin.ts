import {
  CreateDateColumn,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';

export type Constructor<T = object> = new (...args: any[]) => T;

export function AddBase() {
  return class AbstractBase {};
}

export function AddIdColumn<TBase extends Constructor>(Base: TBase) {
  abstract class AbstractBase extends Base {
    @ApiProperty()
    @PrimaryGeneratedColumn()
    id: number;
  }
  return AbstractBase;
}

export function AddDatesColumn<TBase extends Constructor>(Base: TBase) {
  abstract class AbstractBase extends Base {
    @ApiProperty()
    @CreateDateColumn()
    createdAt: Date;

    @ApiProperty()
    @UpdateDateColumn()
    updatedAt: Date;
  }
  return AbstractBase;
}
