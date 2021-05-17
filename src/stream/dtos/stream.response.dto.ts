import { ApiProperty } from '@nestjs/swagger';
import {
  FileListResponseDTO,
  FileTypeEnum,
  ZoneEnum,
} from 'fluentsearch-types';

export class StreamResponseDTO implements FileListResponseDTO {
  @ApiProperty()
  _id: string;

  @ApiProperty()
  owner: string;

  @ApiProperty({ enum: ZoneEnum })
  zone: ZoneEnum;

  @ApiProperty()
  label: string;

  @ApiProperty({ enum: FileTypeEnum })
  type: FileTypeEnum;

  @ApiProperty({ nullable: true })
  refs?: string | undefined;

  @ApiProperty()
  uri: string;

  @ApiProperty()
  thumbnail_uri: string;

  @ApiProperty()
  createAt: Date;

  @ApiProperty()
  updateAt: Date;
}
