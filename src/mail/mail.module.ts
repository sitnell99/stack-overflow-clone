import { Module } from '@nestjs/common';
import { MailerModule } from '@nestjs-modules/mailer';
import { ConfigModule, ConfigService } from '@nestjs/config';

@Module({
  imports: [
    MailerModule.forRootAsync({
      imports: [ConfigModule.forRoot({ envFilePath: '.env' })],
      useFactory: (configService: ConfigService) => {
        return {
          transport: {
            host: configService.get<string>('EMAIL_HOST'),
            auth: {
              user: configService.get<string>('EMAIL_USERNAME'),
              pass: configService.get<string>('EMAIL_PASSWORD'),
            },
          },
        };
      },
      inject: [ConfigService],
    }),
  ],
})
export class MailModule {}
