import { Injectable } from '@nestjs/common';
import { ConfigAppProviderType } from './@types/config-app.type';
import { ConfigEnvType } from './@types/config-env.type';

@Injectable()
export class ConfigService {
  get(): ConfigAppProviderType {
    const {
      DATABASE_CONNECTION,
      DATABASE_USERNAME,
      DATABASE_PASSWORD,
      DATABASE_AUTH_SOURCE,
      JWT_SECRET_KEY,
      JWT_EXPIRES,
      ORIGIN,
      PORT,
      SESSION_EXPIRES,
      SESSION_SECRET,
      STORAGE_HOSTNAME,
    } = process.env as ConfigEnvType;
    return {
      database: {
        connection: DATABASE_CONNECTION,
        username: DATABASE_USERNAME,
        password: DATABASE_PASSWORD,
        authSource: DATABASE_AUTH_SOURCE,
      },
      jwt: {
        secretKey: JWT_SECRET_KEY || 'FluentSearch.JWT.SECRET',
        expires: Number(JWT_EXPIRES) || 300000, // 5 minutes
      },
      node_env:
        (process.env.NODE_ENV as ConfigAppProviderType['node_env']) ||
        'development',
      origin: new RegExp(ORIGIN),
      port: Number(PORT || 5000),
      session: {
        secret: SESSION_SECRET || 'FluentSearch.SESSION.SECRET',
        expires: Number(SESSION_EXPIRES) || 86400000, // one day
      },
      storage_hostname: STORAGE_HOSTNAME,
    };
  }
}
