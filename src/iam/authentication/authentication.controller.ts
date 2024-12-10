import {
  BadRequestException,
  Body,
  ConflictException,
  Controller,
  HttpCode,
  HttpStatus,
  NotFoundException,
  Param,
  Post,
  Res,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthenticationService } from './authentication.service';
import { SignUpDto } from './dto/sign-up.dto';
import { SignInDto } from './dto/sign-in.dto';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiCookieAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { Response } from 'express';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { Auth } from './decorators/auth.decorator';
import { AuthType } from './enums/auth-type.enum';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { ResponseMessage } from '../../common/interfaces/response-message.interface';
import { ActiveUser } from '../decorators/active-user.decorator';
import { TokensRepository } from './tokens-repository';
import { setTokensToCookie } from '../../common/utils/set-tokens-to-cookie';

@ApiBadRequestResponse({
  description: 'Error: Bad Request',
  example: new BadRequestException(
    'Field/s must exist or it is invalid',
  ).getResponse(),
})
@ApiTags('authentication')
@Auth(AuthType.None)
@Controller('authentication')
export class AuthenticationController {
  constructor(
    private readonly authService: AuthenticationService,
    private readonly tokensRepository: TokensRepository,
  ) {}

  @ApiCreatedResponse({
    description: 'Successful',
    example: { message: 'Registration was successful!' },
  })
  @ApiConflictResponse({
    description: 'Error: Not Found',
    example: new ConflictException(
      'User with this email already exists',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Registration' })
  @Post('sign-up')
  signUp(@Body() signUpDto: SignUpDto): Promise<ResponseMessage> {
    return this.authService.signUp(signUpDto);
  }

  @ApiOkResponse({
    description: 'Successful',
    example: { message: 'Sign in was successful' },
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'User with this email does not exist',
    ).getResponse(),
  })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized',
    example: new UnauthorizedException(
      'Passwords does not match',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Log In' })
  @HttpCode(HttpStatus.OK)
  @Post('sign-in')
  async signIn(
    @Res({ passthrough: true }) response: Response,
    @Body() signInDto: SignInDto,
  ): Promise<ResponseMessage> {
    const tokens = await this.authService.signIn(signInDto);
    setTokensToCookie(tokens, response);
    return {
      message: 'Sign in was successful',
    };
  }

  @ApiOkResponse({
    description: 'Successful',
    example: { message: 'Tokens were refresh successfully' },
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('User does not exist').getResponse(),
  })
  @ApiOperation({ summary: 'Refresh tokens' })
  @HttpCode(HttpStatus.OK)
  @Post('refresh-tokens')
  async refreshTokens(
    @Res({ passthrough: true }) response: Response,
    @Body() refreshTokenDto: RefreshTokenDto,
  ): Promise<ResponseMessage> {
    const tokens = await this.authService.refreshTokens(refreshTokenDto);
    setTokensToCookie(tokens, response);
    return {
      message: 'Tokens were refresh successfully',
    };
  }

  @ApiOkResponse({
    description: 'Successful',
    example: {
      message: 'We sent you an email, please follow the instructions',
    },
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException(
      'User with this email does not exist',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Send reset password mail' })
  @HttpCode(HttpStatus.OK)
  @Post('forgot-password')
  forgotPassword(
    @Body() forgotPasswordDto: ForgotPasswordDto,
  ): Promise<ResponseMessage> {
    return this.authService.forgotPassword(forgotPasswordDto);
  }

  @ApiOkResponse({
    description: 'Successful',
    example: {
      message: 'Password was reset successfully',
    },
  })
  @ApiNotFoundResponse({
    description: 'Error: Not Found',
    example: new NotFoundException('User does not exist').getResponse(),
  })
  @ApiOperation({ summary: 'Reset password' })
  @HttpCode(HttpStatus.OK)
  @Post('reset-password/:token')
  resetPassword(
    @Param('token') token: string,
    @Body() resetPasswordDto: ResetPasswordDto,
  ): Promise<ResponseMessage> {
    return this.authService.resetPassword(resetPasswordDto, token);
  }

  @ApiOkResponse({
    description: 'Successful',
    example: {
      message: 'User was successfully logged out',
    },
  })
  @ApiUnauthorizedResponse({
    description: 'Error: Unauthorized',
    example: new UnauthorizedException(
      'You have no access, please sign in',
    ).getResponse(),
  })
  @ApiOperation({ summary: 'Log Out' })
  @ApiCookieAuth()
  @HttpCode(HttpStatus.OK)
  @Auth(AuthType.Bearer)
  @Post('log-out')
  async logOut(
    @Res({ passthrough: true }) response: Response,
    @ActiveUser('sub') userId: number,
  ): Promise<ResponseMessage> {
    response.clearCookie('accessToken');
    response.clearCookie('refreshToken');
    await this.tokensRepository.remove(userId);

    return {
      message: 'User was successfully logged out',
    };
  }
}
