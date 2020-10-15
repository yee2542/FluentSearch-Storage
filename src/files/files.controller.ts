import {
  Controller,
  Get,
  HttpCode,
  Param,
  Post,
  UploadedFiles,
  UseInterceptors,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
@Controller('files')
export class FilesController {
  @Post('/upload')
  @HttpCode(201)
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 5 }]))
  async uploadFile(@UploadedFiles() files): Promise<void> {
    console.log(files);
    return files;
  }

  @Get('/:id')
  async getFileById(@Param('id') id: string) {
    return id;
  }
}
