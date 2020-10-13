import { Controller, Get, HttpCode, Param, Post } from '@nestjs/common';
import { Response } from 'express';
@Controller('files')
export class FilesController {
    @Post('/upload')
    @HttpCode(201)
    async uploadFile(): Promise<Response> {
        return
    }

    @Get('/:id')
    async getFileById(@Param('id') id: string) {
        return id
    }
}
