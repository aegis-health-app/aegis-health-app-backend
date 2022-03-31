import { Body, Controller, Delete, Get, Post, Req, Res } from '@nestjs/common';
import { AddHealthrecord, AllHealthRecords } from './healthRecord.interface';
import { HealthRecordService } from './healthRecord.service';

@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService) { }

  @Get('getAll')
  async getHealthRecord(@Req() req): Promise<AllHealthRecords> {
    return await this.healthRecordService.getHealthRecord(req.user.uid)
  }

  // 2: post health record
  // return status code
  // health record column name cannot be duplicated
  @Post('add')
  async addHealthRecord(AddInfo: AddHealthrecord,@Req() req,@Res() res): Promise<string> {
    await this.healthRecordService.addHealthRecord(req.user.uid, AddInfo)
    return res.status(200).json({
      statusCode: 200,
      message: "Added health record to database successfully"
    })
  }

  // 3: delete a health record
  // get hrName from frontend
  @Delete('delete')
  async deleteHealthRecord(@Req() req,@Res() res): Promise<string>{
    await this.healthRecordService.deleteHealthRecord(req.user.uid)
    return res.status(200).json({
      statusCode: 200,
      message: "Deleted health record from database successfully"
    })
  }

}
