import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { UserSessionDto } from 'fluentsearch-types';
import jwt from 'jsonwebtoken';

export const UserTokenInfo = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): UserSessionDto => {
    const req = ctx.switchToHttp().getRequest() as Request;
    const token = req.cookies.Authorization;
    const extractToken = token.replace('Bearer ', '');
    return jwt.decode(extractToken) as UserSessionDto;
  },
);
