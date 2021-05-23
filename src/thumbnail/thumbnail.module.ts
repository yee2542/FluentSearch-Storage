import { Module } from '@nestjs/common';
import { StorageModule } from '../storage/storage.module';
import { ThumbnailController } from './thumbnail.controller';
import { ThumbnailService } from './thumbnail.service';

@Module({
  imports: [StorageModule],
  providers: [ThumbnailService],
  controllers: [ThumbnailController],
})
export class ThumbnailModule {}
