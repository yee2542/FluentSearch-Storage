import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { ConfigModule } from '../config/config.module';
import { MulterConfigService } from '../multer.config-service';
import { StreamService } from './stream.service';
import { StreamController } from './stream.controller';

@Module({
  imports: [],
  providers: [StreamService],
  controllers: [StreamController],
})
export class StreamModule {}
