import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import {
  FileDocument,
  FILES_SCHEMA_NAME,
  FileTypeEnum,
} from 'fluentsearch-types';
import { LeanDocument, Model } from 'mongoose';
import { FileNotExisistException } from '../common/exception/file-not-exists-exception';
import { ConfigService } from '../config/config.service';
import { InvalidUserAccessException } from '../storage/exceptions/invalid-user-access.exception';
import { FileDashboardDTO } from './dtos/dashboard/file-dashboard.dto';
import { RecentPreviews } from './dtos/recent-files.dto';

@Injectable()
export class FilesService {
  constructor(
    @InjectModel(FILES_SCHEMA_NAME)
    private readonly fileModel: Model<FileDocument>,
    private readonly configService: ConfigService,
  ) {}

  async getDashboard(owner: string): Promise<FileDashboardDTO> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);
    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const photoTotal = await this.fileModel
      .find({ owner, type: FileTypeEnum.Image })
      .countDocuments();
    const photoToday = await this.fileModel
      .find({
        owner,
        createAt: { $gte: start, $lt: end },
        type: FileTypeEnum.Image,
      })
      .countDocuments();
    const videoTotal = await this.fileModel
      .find({ owner, type: FileTypeEnum.Video })
      .countDocuments();
    const videoToday = await this.fileModel
      .find({
        owner,
        createAt: { $gte: start, $lt: end },
        type: FileTypeEnum.Video,
      })
      .countDocuments();

    return {
      photo: {
        total: photoTotal,
        today: photoToday,
      },
      video: {
        total: videoTotal,
        today: videoToday,
      },
    };
  }

  async getFile(
    fileId: string,
    owner: string,
  ): Promise<LeanDocument<FileDocument>> {
    const file = await this.fileModel.findById(fileId).lean();
    if (!file) throw new FileNotExisistException();
    if (file.owner !== owner) throw new InvalidUserAccessException();
    return file;
  }

  async getRecentFilesByUser(userId: string, skip: number, limit: number) {
    return this.fileModel
      .aggregate<RecentPreviews>([
        { $match: { owner: userId } },
        { $sort: { createAt: -1 } },
        { $skip: skip },
        { $limit: limit },

        //   file
        {
          $addFields: {
            uri: {
              $concat: [
                `http://${this.configService.get().storage_hostname}/`,
                '$owner',
                '/',
                {
                  $toString: '$_id',
                },
              ],
            },
            uri_thumbnail: {
              $concat: [
                `http://${this.configService.get().storage_hostname}/`,
                '$owner',
                '/',
                {
                  $toString: '$_id',
                },
                '/thumbnail',
              ],
            },
          },
        },

        //   select
        {
          $project: {
            _id: 1,
            owner: 1,
            original_filename: 1,
            uri: 1,
            uri_thumbnail: 1,
            createAt: 1,
            updateAt: 1,
            type: 1,
          },
        },

        //   group to date
        {
          $addFields: {
            date: {
              $dateToString: {
                format: '%d-%m-%Y',
                date: '$createAt',
                timezone: 'Asia/Bangkok',
              },
            },
          },
        },
        {
          $group: {
            _id: '$date',

            files: { $push: '$$ROOT' },
          },
        },
        {
          $addFields: {
            date: '$_id',
          },
        },
      ])
      .allowDiskUse(true);
  }
}
