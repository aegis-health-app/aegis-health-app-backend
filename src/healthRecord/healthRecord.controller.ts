import { Controller, Delete, Get, Param, Post, Req, Res, UseGuards, UsePipes, ValidationPipe } from '@nestjs/common';
import { ApiBody, ApiConflictResponse, ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiUnauthorizedResponse } from '@nestjs/swagger';
import { UserGuard } from 'src/auth/jwt.guard';
import { AddHealthrecordDto, AllHealthRecordDto } from './healthRecord.dto';
import { HealthRecordService } from './healthRecord.service';

@Controller('healthRecord')
export class HealthRecordController {
  constructor(private readonly healthRecordService: HealthRecordService) { }

  @ApiOperation({ description: "Get all health records" })
  @ApiBody({ type: AllHealthRecordDto })
  @ApiOkResponse({ description: "Succesful in getting all health records" })
  @ApiNotFoundResponse({ description: "No records found for this user" })
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Get('getAll')
  async getHealthRecord(@Req() req): Promise<AllHealthRecordDto> {
    return await this.healthRecordService.getHealthRecord(req.user.uid)
  }

  @ApiOperation({ description: "Add a health record" })
  @ApiBody({ type: AddHealthrecordDto })
  @ApiOkResponse({ description: "Added health record to the database succesfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "Health record name is repeated" })
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Post('add')
  async addHealthRecord(AddRecordInfo: AddHealthrecordDto, @Req() req, @Res() res): Promise<string> {
    await this.healthRecordService.addHealthRecord(req.user.uid, AddRecordInfo)
    return res.status(200).json({
      statusCode: 200,
      message: "Added health record to the database successfully"
    })
  }

  @ApiOperation({ description: "Delete a health record" })
  @ApiOkResponse({ description: "Deleted health record from the database succesfully" })
  @ApiNotFoundResponse({ description: "User not found" })
  @ApiConflictResponse({ description: "This health record doesn't exist" })
  @UseGuards(UserGuard)
  @UsePipes(new ValidationPipe({ whitelist: true }))
  @Delete('delete/:hrName')
  async deleteHealthRecord(@Param('hrName') hrName: string, @Req() req, @Res() res): Promise<string> {
    await this.healthRecordService.deleteHealthRecord(req.user.uid, hrName)
    return res.status(200).json({
      statusCode: 200,
      message: "Deleted health record from the database successfully"
    })
  }

}
