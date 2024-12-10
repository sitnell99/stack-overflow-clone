import { registerAs } from '@nestjs/config';
import { config } from 'dotenv';
import { JWT_CONFIG_KEY } from '../iam.constants';

config({ path: 'src/.env' });

export default registerAs(JWT_CONFIG_KEY, () => {
  return {
    secret: process.env.JWT_SECRET,
    audience: process.env.JWT_TOKEN_AUDIENCE,
    issuer: process.env.JWT_TOKEN_ISSUER,
    accessTokenTtl: parseInt(process.env.JWT_ACCESS_TOKEN_TTL ?? '3600', 10),
    refreshTokenTtl: parseInt(process.env.JWT_REFRESH_TOKEN_TTL ?? '86400', 10),
    resetTokenTtl: parseInt(process.env.JWT_RESET_TOKEN_TTL ?? '300', 10),
  };
});
