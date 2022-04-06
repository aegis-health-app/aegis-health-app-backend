import { Test, TestingModule } from '@nestjs/testing';
import { EmotionTrackingController } from './emotion-tracking.controller';

describe('EmotionTrackingController', () => {
  let controller: EmotionTrackingController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmotionTrackingController],
    }).compile();

    controller = module.get<EmotionTrackingController>(EmotionTrackingController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
