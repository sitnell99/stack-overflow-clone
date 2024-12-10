import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';
import {
  AddBase,
  AddDatesColumn,
  AddIdColumn,
} from '../../common/mixins/add-general-columns.mixin';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('answers')
export class Answer extends AddDatesColumn(AddIdColumn(AddBase())) {
  @Column()
  body: string;

  @Column()
  userId: number;

  @Column()
  questionId: number;

  @ApiHideProperty()
  @JoinColumn({ name: 'question_id' })
  @ManyToOne(() => Question, { onDelete: 'CASCADE' })
  question: Question;

  @ApiHideProperty()
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;
}
