import { Test, TestingModule } from '@nestjs/testing';
import { MemoryPracticeService } from './memory-practice.service';

describe('MemoryPracticeService', () => {
  let service: MemoryPracticeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MemoryPracticeService],
    }).compile();

    service = module.get<MemoryPracticeService>(MemoryPracticeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
