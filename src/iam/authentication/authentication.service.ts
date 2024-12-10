import {
  ConflictException,
  Inject,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { HashingService } from '../hashing/hashing.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import { JwtService } from '@nestjs/jwt';
import jwtConfig from '../config/jwt.config';
import { ConfigService, ConfigType } from '@nestjs/config';
import { ActiveUserData } from '../interfaces/active-user-data.interface';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { TokensRepository } from './tokens-repository';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { MailerService } from '@nestjs-modules/mailer';
import { Translations } from '../../i18n/en_US';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { JwtPayload } from '../interfaces/jwt-payload.interface';
import { AuthTokens } from '../interfaces/auth-tokens.interface';
import { ResponseMessage } from '../../common/interfaces/response-message.interface';
import { Roles } from '../authorization/enums/role.enum';
import { RolesService } from '../authorization/roles.service';

@Injectable()
export class AuthenticationService {
  constructor(
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly hashingService: HashingService,
    private readonly jwtService: JwtService,
    @Inject(jwtConfig.KEY)
    private readonly jwtConfiguration: ConfigType<typeof jwtConfig>,
    private readonly tokensRepository: TokensRepository,
    private readonly mailService: MailerService,
    private readonly configService: ConfigService,
    private readonly rolesService: RolesService,
  ) {}

  async signUp(signUpDto: SignUpDto): Promise<ResponseMessage> {
    try {
      const user = this.usersRepository.create({
        email: signUpDto.email,
        password: await this.hashingService.hash(signUpDto.password),
        roles: [await this.rolesService.findOneByName(Roles.USER)],
      });

      const existingUser = await this.usersRepository.findOneBy({
        email: signUpDto.email,
      });

      if (existingUser) {
        throw new ConflictException('User with this email already exists');
      }

      await this.usersRepository.save(user);

      return {
        message: 'Registration was successful!',
      };
    } catch (error) {
      if (error.status === 409) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to create user. Please try again later.',
      );
    }
  }

  async signIn(signInDto: SignInDto): Promise<AuthTokens> {
    try {
      const user = await this.usersRepository.findOneBy({
        email: signInDto.email,
      });
      if (!user) {
        throw new NotFoundException('User with this email does not exist');
      }
      const isEqual = await this.hashingService.compare(
        signInDto.password,
        user.password,
      );
      if (!isEqual) {
        throw new UnauthorizedException('Passwords does not match');
      }

      return await this.generateTokens(user);
    } catch (error) {
      if (error.status === 401 || error.status === 404) {
        throw error;
      }

      console.error(error);
      throw new InternalServerErrorException(
        'Failed to log in. Please try again later.',
      );
    }
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<AuthTokens> {
    try {
      const { sub } = await this.jwtService.verifyAsync<
        Pick<ActiveUserData, 'sub'>
      >(refreshTokenDto.refreshToken, {
        secret: this.jwtConfiguration.secret,
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
      });

      const user = await this.usersRepository.findOneByOrFail({
        id: sub,
      });
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      await this.tokensRepository.validate(
        user.id,
        refreshTokenDto.refreshToken,
      );

      await this.tokensRepository.remove(user.id);

      return this.generateTokens(user);
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }

      console.error(error);
      throw new InternalServerErrorException(
        'Failed to refresh token. Please try again later.',
      );
    }
  }

  async generateTokens(user: User): Promise<AuthTokens> {
    const [accessToken, refreshToken] = await Promise.all([
      this.signToken<Partial<ActiveUserData>>(
        user.id,
        this.jwtConfiguration.accessTokenTtl,
        {
          email: user.email,
        },
      ),
      this.signToken(user.id, this.jwtConfiguration.refreshTokenTtl),
    ]);
    await this.tokensRepository.create(user.id, accessToken, refreshToken);

    return {
      accessToken,
      refreshToken,
    };
  }

  private async signToken<T>(
    userId: number,
    expiresIn: number,
    payload?: T,
  ): Promise<string> {
    return await this.jwtService.signAsync(
      {
        sub: userId,
        ...payload,
      },
      {
        audience: this.jwtConfiguration.audience,
        issuer: this.jwtConfiguration.issuer,
        secret: this.jwtConfiguration.secret,
        expiresIn,
      },
    );
  }

  async forgotPassword(
    forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseMessage> {
    try {
      const user = await this.usersRepository.findOneBy({
        email: forgotPasswordDto.email,
      });
      if (!user) {
        throw new NotFoundException('User with this email does not exist');
      }

      const token = await this.signToken(
        user.id,
        this.jwtConfiguration.resetTokenTtl,
      );

      await this.tokensRepository.create(user.id, token);

      return await this.sendResetPasswordMail(forgotPasswordDto.email, token);
    } catch (error) {
      if (error.status === 404) {
        throw error;
      }
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to handle forgot password request. Please try again later.',
      );
    }
  }

  private async sendResetPasswordMail(
    recipient: string,
    token: string,
  ): Promise<ResponseMessage> {
    try {
      await this.mailService.sendMail({
        from: this.configService.get<string>('EMAIL_SENDER'),
        to: recipient,
        subject: Translations['forgotPassword.subject'],
        text: `${Translations['forgotPassword.text']}${this.configService.get<string>('CLIENT_URL')}/reset-password?token=${token}`,
      });
      return {
        message: 'We sent you an email, please follow the instructions.',
      };
    } catch (error) {
      console.error(error);
      throw new InternalServerErrorException(
        'Failed to send mail. Please try again later.',
      );
    }
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
    token: string,
  ): Promise<ResponseMessage> {
    try {
      const decodedToken = await this.jwtService.verifyAsync(
        token,
        this.jwtConfiguration,
      );

      await this.tokensRepository.validate(decodedToken.sub, token);

      const user = await this.usersRepository.findOneBy({
        id: decodedToken.sub,
      });
      if (!user) {
        throw new NotFoundException('User does not exist');
      }

      user.password = await this.hashingService.hash(resetPasswordDto.password);
      await this.usersRepository.save(user);
      return {
        message: 'Password was reset successfully',
      };
    } catch (error) {
      console.error(error);
      if (error.status === 404) {
        throw error;
      }
      throw new InternalServerErrorException(
        'Failed to reset password. Please try again later.',
      );
    }
  }

  async getPayloadFromToken(token: string): Promise<JwtPayload> {
    return await this.jwtService.verifyAsync(token, this.jwtConfiguration);
  }
}
