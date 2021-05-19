import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { FileDocument, FILES_SCHEMA_NAME } from './schemas/file.schema';

@Injectable()
export class StorageService {
  constructor(
    @InjectModel(FILES_SCHEMA_NAME)
    private readonly userModel: Model<FileDocument>,
  ) {}
}
