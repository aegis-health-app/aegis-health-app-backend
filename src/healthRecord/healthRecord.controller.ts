import { Body, Controller, Get, Post, Req, Res } from '@nestjs/common';
import { AllHealthRecords } from './healthRecord.interface';
import { HealthRecordService } from './healthRecord.service';

@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService) { }

  // 1: get health record ทั้งหมดที่ elderly คนนี้มี
  // health record column name cannot be duplicated
  @Get('/elderly')
  async getHealthRecord(@Req() req): Promise<AllHealthRecords> {
    return await this.healthRecordService.getHealthRecord(req.user.uid)
  }

  // 2: post health record
  // return status code
  @Post('/add')
  addHealthRecord(@Res() res): string {
    return res.status(200).json({
      statusCode: 200,
      message: "Added health record to database successfully"
    })
  }

  // 3: delete a health record
  // get hrName from frontend


}
