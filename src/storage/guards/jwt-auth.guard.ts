import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Request } from 'express';
import { UserSessionDto } from 'fluentsearch-types';
import { ConfigService } from '../../config/config.service';

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest() as Request;
    const token = req.cookies.Authorization;

    if (!token) return false;

    const extractToken = token.replace('Bearer ', '');
    console.log(extractToken);
    try {
      const { _id } = this.jwtService.verify(extractToken, {
        secret: this.configService.get().jwt.secretKey,
        ignoreExpiration: false,
      }) as Pick<UserSessionDto, '_id'>;
      return !!_id;
    } catch (err) {
      Logger.error(err, 'JwtAuthGuard');
      return false;
    }
  }
}
