import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST_USER_KEY } from '../../iam.constants';
import { TokensRepository } from '../tokens-repository';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../../../users/entities/user.entity';
import { Repository } from 'typeorm';
import { getTokensFromCookie } from '../../../common/utils/get-tokens-from-cookie';
import { AuthenticationService } from '../authentication.service';

@Injectable()
export class AccessTokenGuard implements CanActivate {
  constructor(
    private readonly tokensRepository: TokensRepository,
    @InjectRepository(User)
    private readonly usersRepository: Repository<User>,
    private readonly authenticationService: AuthenticationService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      const request = context.switchToHttp().getRequest();
      const tokens = getTokensFromCookie(request);

      const payload = await this.verifyCachedAccessToken(tokens.accessToken);

      const user = await this.usersRepository.findOneByOrFail({
        id: payload.sub,
      });
      if (!user) {
        throw new UnauthorizedException('User does not exist');
      }
      const permissionsList = user.roles.flatMap((role) =>
        role.permissions.map((permission) => permission.name),
      );
      const permissions = new Set(permissionsList);

      request[REQUEST_USER_KEY] = {
        ...payload,
        permissions: Array.from(permissions),
      };

      return true;
    } catch (error) {
      if (error.status === 401) {
        throw error;
      }

      console.error(error);
      throw new UnauthorizedException('You have no access, please sign in');
    }
  }

  private async verifyCachedAccessToken(token: string) {
    const payload = await this.authenticationService.getPayloadFromToken(token);

    if (!payload) {
      throw new UnauthorizedException('Invalid Token');
    }

    const redisTokens = await this.tokensRepository.getAll(payload.sub);

    if (!redisTokens?.includes(token)) {
      await this.tokensRepository.remove(payload.sub);
      throw new UnauthorizedException('Invalid Token');
    }

    return payload;
  }
}
