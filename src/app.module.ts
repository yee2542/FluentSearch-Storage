import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from './config/config.module';
import { StreamModule } from './stream/stream.module';

@Module({
  imports: [ConfigModule, StreamModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
