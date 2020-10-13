import { Controller, Get, HttpCode, Param, Post, Req, UploadedFiles, UseInterceptors, UsePipes } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { Request, Response } from 'express';
import { FileStreamUploadInterceptor } from './file.stream.upload.interceptor';
@Controller('files')
export class FilesController {
    @Post('/upload')
    @HttpCode(201)
    @UseInterceptors(FileFieldsInterceptor(
        [
            { name: 'files', maxCount: 5 }
        ]
    ))
    @UseInterceptors(new FileStreamUploadInterceptor())
    async uploadFile(@UploadedFiles() files): Promise<void> {
        console.log(files)
        return
    }

    @Get('/:id')
    async getFileById(@Param('id') id: string) {
        return id
    }
}
