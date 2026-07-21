import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import type {
  AuthenticatedRequest,
  JwtPayload,
} from '../../modules/auth/auth.types';

const unauthorizedMessage = 'Требуется авторизация';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest<AuthenticatedRequest>();
    const token = this.extractToken(request.headers.authorization);

    if (!token) {
      throw new UnauthorizedException(unauthorizedMessage);
    }

    try {
      request.auth = await this.jwtService.verifyAsync<JwtPayload>(token);
      return true;
    } catch {
      throw new UnauthorizedException(unauthorizedMessage);
    }
  }

  private extractToken(authorization?: string) {
    const [type, token] = authorization?.split(' ') ?? [];
    return type === 'Bearer' && token ? token : undefined;
  }
}
