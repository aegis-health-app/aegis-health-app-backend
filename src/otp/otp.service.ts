import { HttpStatus, HttpException, Injectable } from '@nestjs/common';
import { RequestOtpResponseDTO } from './dto/otp.dto';
@Injectable()
export class OtpService {
  async getOtp(phoneNumber: string): Promise<RequestOtpResponseDTO> {
    try {
      const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l');

      const res = await sdk.post(
        '/v2/otp/request',
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          msisdn: phoneNumber,
        },
        { Accept: 'application/json' }
      );
      return res;
    } catch (err) {
      throw new HttpException('Failed Requesting OTP', HttpStatus.BAD_REQUEST);
    }
  }

  async verifyOtp(token: string, pin: string): Promise<{ status: number; message: string }> {
    try {
      const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l');

      const res = await sdk.post(
        '/v2/otp/verify',
        {
          key: process.env.OTP_KEY,
          secret: process.env.OTP_SECRETKEY,
          token: token,
          pin: pin,
        },
        { Accept: 'application/json' }
      );
      console.log('verification successful');
      return { status: res.status, message: res.message };
    } catch (err) {
      throw new HttpException('Failed Verifying OTP', HttpStatus.UNAUTHORIZED);
    }
  }
}
