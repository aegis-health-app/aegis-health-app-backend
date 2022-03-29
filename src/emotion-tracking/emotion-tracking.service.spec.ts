import { Test, TestingModule } from '@nestjs/testing';
import { EmotionTrackingService } from './emotion-tracking.service';

describe('EmotionTrackingService', () => {
  let service: EmotionTrackingService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmotionTrackingService],
    }).compile();

    service = module.get<EmotionTrackingService>(EmotionTrackingService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
