import { Controller, Get, Param, Post, Res } from '@nestjs/common';
import { Response } from 'express'
@Controller('files')
export class FilesController {
    @Post('/upload')
    async uploadFile(@Res() res: Response) {
        return res.sendStatus(200)
    }

    @Get('/:id')
    async getFileById(@Param('id') id: string) {
        return id
    }
}
