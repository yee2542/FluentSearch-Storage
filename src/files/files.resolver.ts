import { Args, Query, Resolver } from '@nestjs/graphql';
import { ConfigService } from '../config/config.service';
import { FileDashboardDTO } from './dtos/dashboard/file-dashboard.dto';
import { FileModelDTO } from './dtos/file/file.dto.model';
import { RecentFiles } from './dtos/recent-files.dto';
import { SkipLimitArgs } from './dtos/skip-limit.args';
import { FilesService } from './files.service';

@Resolver()
export class FilesResolver {
  constructor(
    private readonly fileService: FilesService,
    private readonly configSerivce: ConfigService,
  ) {}

  @Query(() => FileDashboardDTO)
  async GetFileDashboard(
    @Args('owner') owner: string,
  ): Promise<FileDashboardDTO> {
    return this.fileService.getDashboard(owner);
  }

  @Query(() => FileModelDTO)
  async GetFileById(
    @Args('id') fileId: string,
    @Args('owner') owner: string,
  ): Promise<FileModelDTO> {
    const file = await this.fileService.getFile(fileId, owner);
    return {
      ...file,
      uri: `http://${this.configSerivce.get().storage_hostname}/${owner}/${
        file._id
      }`,
    };
  }

  @Query(() => RecentFiles)
  async GetRecentFiles(
    @Args('owner') owner: string,
    @Args() skipLimit: SkipLimitArgs,
  ): Promise<RecentFiles> {
    const id = owner;
    const result = await this.fileService.getRecentFilesByUser(
      id,
      skipLimit.skip,
      skipLimit.limit,
    );
    return { result };
  }
}
