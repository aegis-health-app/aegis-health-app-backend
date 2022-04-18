import { Test, TestingModule } from '@nestjs/testing';
import { MemoryPracticeController } from './memory-practice.controller';

describe('MemoryPracticeController', () => {
  let controller: MemoryPracticeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MemoryPracticeController],
    }).compile();

    controller = module.get<MemoryPracticeController>(MemoryPracticeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
