import { IsEmail, IsString } from 'class-validator';

export class SendMailDto {
  @IsEmail()
  recipient: string;

  @IsString()
  subject: string;

  @IsString()
  text: string;
}
