import { Test, TestingModule } from '@nestjs/testing';
import { HealthRecordController } from './healthRecord.controller';

describe('HealthRecordController', () => {
  let controller: HealthRecordController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthRecordController],
    }).compile();

    controller = module.get<HealthRecordController>(HealthRecordController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
