import { Module } from '@nestjs/common';
import { GraphQLFederationModule } from '@nestjs/graphql';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigDatabaseService } from './config/config.database.service';
import { ConfigModule } from './config/config.module';
import { ConfigService } from './config/config.service';
import { FilesModule } from './files/files.module';
import { StorageModule } from './storage/storage.module';
import { ThumbnailModule } from './thumbnail/thumbnail.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    FilesModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ConfigDatabaseService,
    }),
    ThumbnailModule,
    GraphQLFederationModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        return {
          path: '/graphql',
          introspection: true,
          playground: {
            settings: {
              'request.credentials': 'include',
            },
          },
          cors: {
            origin: configService.get().origin,
            credentials: true,
          },
          installSubscriptionHandlers: false,
          autoSchemaFile: 'schema.gql',
          sortSchema: true,
          context: ({ req, res, payload, connection }) => ({
            req,
            res,
            payload,
            connection,
          }),
        };
      },
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
