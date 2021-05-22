import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigDatabaseService } from './config/config.database.service';
import { ConfigModule } from './config/config.module';
import { StorageModule } from './storage/storage.module';

@Module({
  imports: [
    ConfigModule,
    StorageModule,
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useClass: ConfigDatabaseService,
    }),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
