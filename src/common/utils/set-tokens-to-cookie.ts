import { AuthTokens } from '../../iam/interfaces/auth-tokens.interface';
import { Response } from 'express';

export function setTokensToCookie(tokens: AuthTokens, response: Response) {
  for (const [key, value] of Object.entries(tokens)) {
    response.cookie(key, value, {
      httpOnly: true,
      secure: true,
      sameSite: true,
    });
  }
}
