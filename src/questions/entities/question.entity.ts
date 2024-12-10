import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  JoinColumn,
  OneToOne,
  JoinTable,
  ManyToMany,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import {
  AddBase,
  AddDatesColumn,
  AddIdColumn,
} from '../../common/mixins/add-general-columns.mixin';
import { Answer } from '../../answers/entities/answer.entity';
import { ApiHideProperty } from '@nestjs/swagger';
import { Tag } from '../../tags/entities/tag.entity';

@Entity('questions')
export class Question extends AddDatesColumn(AddIdColumn(AddBase())) {
  @Column()
  title: string;

  @Column()
  body: string;

  @Column()
  userId: number;

  @Column({ nullable: true })
  acceptedAnswerId: number;

  @JoinColumn({ name: 'accepted_answer_id' })
  @OneToOne(() => Answer)
  answer: Answer;

  @OneToMany(() => Answer, (answer) => answer.question)
  answers: Answer[];

  @ApiHideProperty()
  @JoinColumn({ name: 'user_id' })
  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  user: User;

  @JoinTable({
    name: 'question_tag',
    joinColumn: {
      name: 'question_id',
      referencedColumnName: 'id',
    },
    inverseJoinColumn: {
      name: 'tag_id',
      referencedColumnName: 'id',
    },
  })
  @ManyToMany(() => Tag, { eager: true })
  tags: Tag[];
}
