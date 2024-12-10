import { Request } from 'express';
import { AuthTokens } from '../../iam/interfaces/auth-tokens.interface';

export function getTokensFromCookie(request: Request): AuthTokens {
  return {
    accessToken: request.cookies?.['accessToken'],
    refreshToken: request.cookies?.['refreshToken'],
  };
}
