import { Test, TestingModule } from '@nestjs/testing';
import { ElderlyHomeController } from './elderlyHome.controller';

describe('ElderlyHomeController', () => {
  let controller: ElderlyHomeController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ElderlyHomeController],
    }).compile();

    controller = module.get<ElderlyHomeController>(ElderlyHomeController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
