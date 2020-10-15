import { Module } from '@nestjs/common';
import { FilesController } from './files.controller';
import { FilesService } from './files.service';
import { MulterModule } from '@nestjs/platform-express';
import { FileConfigService } from './file.config.service';

@Module({
  imports: [MulterModule.registerAsync({ useClass: FileConfigService })],
  controllers: [FilesController],
  providers: [FilesService],
})
export class FilesModule {}
