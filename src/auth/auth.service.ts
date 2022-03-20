import { HttpStatus, HttpException, Injectable } from '@nestjs/common'
@Injectable()
export class AuthService {
  async getOtp(phoneNumber: string) {
    // try {
    //   const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l')

    //   const res = await sdk.post(
    //     '/v2/otp/request',
    //     {
    //       key: process.env.OTP_KEY || '1727804793031446',
    //       secret: process.env.OTP_SECRETKEY || 'b97cef0144f23791501a33afe87a23f5',
    //       msisdn: phoneNumber,
    //     },
    //     { Accept: 'application/json' }
    //   )
    //   return res
    // } catch (err) {
    //   console.error(err)
    //   throw new HttpException('Failed Requesting OTP', HttpStatus.BAD_REQUEST)
    // }

    // MOCKING RESPONSE
    return {
        status: "success",
        token: "aWBmLKlYdgx2kjOIOH2A38pZyNvoEzMV",
        refno: "73XRR"
    }
  }

  async verifyOtp(token: string, pin: string) {
    // try {
    //   const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l')

    //   const res = await sdk.post(
    //     '/v2/otp/verify',
    //     {
    //       key: process.env.OTP_KEY || '1727804793031446',
    //       secret: process.env.OTP_SECRETKEY || 'b97cef0144f23791501a33afe87a23f5',
    //       token: token,
    //       pin: pin,
    //     },
    //     { Accept: 'application/json' }
    //   )
    //   console.log(res)
    //   console.log('verification successful')
    //   return { status: res.status, message: res.message }
    // } catch (err) {
    //   console.log('verifiacation failed')
    //   console.log(err)
    //   throw new HttpException('Failed Verifying OTP', HttpStatus.UNAUTHORIZED)
    // }

    //MOCKING RESPONSE
    if (token === process.env.MOCKING_OTP_TOKEN && pin === process.env.MOCKING_OTP) {
      return {
        status: "success",
        message: "Code is correct."
      }
    } else {
      return {
        status: "fail",
        message: "Code is incorrect."
      }
    }
  }
}