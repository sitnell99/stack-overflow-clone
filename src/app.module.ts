import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersModule } from './users/users.module';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { IamModule } from './iam/iam.module';
import { RedisModule } from './redis/redis.module';
import { QuestionsModule } from './questions/questions.module';
import { AnswersModule } from './answers/answers.module';
import * as Joi from '@hapi/joi';
import { MailModule } from './mail/mail.module';
import { SnakeNamingStrategy } from './common/naming-strategies/snake-naming.strategy';
import { TagsModule } from './tags/tags.module';
import { VotesModule } from './votes/votes.module';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [
        ConfigModule.forRoot({
          validationSchema: Joi.object({
            DB_HOST: Joi.required(),
            DB_PORT: Joi.number().default(5432),
          }),
        }),
      ],
      useFactory: (configService: ConfigService) => {
        return {
          type: 'postgres',
          host: configService.get<string>('DB_HOST'),
          port: configService.get<number>('DB_PORT'),
          username: configService.get<string>('DB_USERNAME'),
          password: configService.get<string>('DB_PASSWORD'),
          database: configService.get<string>('DB_NAME'),
          autoLoadEntities: true,
          namingStrategy: new SnakeNamingStrategy(),
        };
      },
      inject: [ConfigService],
    }),
    UsersModule,
    IamModule,
    RedisModule,
    MailModule,
    QuestionsModule,
    AnswersModule,
    TagsModule,
    VotesModule,
  ],
})
export class AppModule {}
