import { Request } from 'express'
import { StorageEngine } from 'multer'

class FileCustomStorage implements StorageEngine {
    _handleFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error?: any, info?: Partial<Express.Multer.File>) => void
    ): void {
        let fileSize = 0
        file.stream.on('data', (chunk: Buffer) => fileSize += chunk.byteLength)
        file.stream.on('close', () => {
            callback(null, { ...file, size: fileSize })
            console.log(fileSize)
        })
        return
    }

    _removeFile(
        req: Request,
        file: Express.Multer.File,
        callback: (error: Error) => void
    ): void {
        return
    }
}


export default new FileCustomStorage()