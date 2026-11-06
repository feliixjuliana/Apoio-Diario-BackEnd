import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as jwt from 'jsonwebtoken';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private configService: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const authHeader = request.headers.authorization;

    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Token not provided');
    }

    const token = authHeader.split(' ')[1];
    const secret = this.configService.get<string>('jwt.secret') ?? 'default_secret';

    let payload: string | jwt.JwtPayload;
    try {
      payload = jwt.verify(token, secret);
    } catch {
      throw new UnauthorizedException('Invalid or expired token');
    }

    if (typeof payload === 'string' || typeof payload.id !== 'string' || !payload.id) {
      throw new UnauthorizedException('Invalid or expired token');
    }

    const user = await this.prisma.users.findUnique({
      where: { id: payload.id },
      select: { id: true },
    });
    if (!user) throw new UnauthorizedException('Invalid or expired token');

    request.user = payload;
    return true;
  }
}
