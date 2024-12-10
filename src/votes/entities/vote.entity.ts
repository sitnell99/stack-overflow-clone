import { Column, Entity, JoinColumn, ManyToOne } from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Question } from '../../questions/entities/question.entity';
import { Answer } from '../../answers/entities/answer.entity';
import {
  AddBase,
  AddDatesColumn,
  AddIdColumn,
} from '../../common/mixins/add-general-columns.mixin';
import { ApiHideProperty } from '@nestjs/swagger';

@Entity('votes')
export class Vote extends AddDatesColumn(AddIdColumn(AddBase())) {
  @Column()
  userId: number;

  @Column({ nullable: true })
  questionId: number;

  @Column({ nullable: true })
  answerId: number;

  @Column()
  isUpvote: boolean;

  @ApiHideProperty()
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @ApiHideProperty()
  @JoinColumn({ name: 'question_id' })
  @ManyToOne(() => Question)
  question: Question;

  @ApiHideProperty()
  @JoinColumn({ name: 'answer_id' })
  @ManyToOne(() => Answer)
  answer: Answer;
}
