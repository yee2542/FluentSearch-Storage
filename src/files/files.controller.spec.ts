import { Test, TestingModule } from '@nestjs/testing';
import { FilesController } from './files.controller';

describe('FilesController', () => {
  let controller: FilesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [FilesController],
    }).compile();

    controller = module.get<FilesController>(FilesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  // it('should return undefined after upload', async () => {
  //   const result = await controller.uploadFile()
  //   expect(result).toBeUndefined()
  // })

  it('should return id', async () => {
    const mockId = '1'
    const result = await controller.getFileById(mockId)
    expect(result).toBe(mockId)
  })
});
