import { Test, TestingModule } from '@nestjs/testing';
import { ElderlyHomeService } from './elderlyHome.service';

describe('ElderlyHomeService', () => {
  let service: ElderlyHomeService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ElderlyHomeService],
    }).compile();

    service = module.get<ElderlyHomeService>(ElderlyHomeService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
