import { Injectable } from '@nestjs/common'

@Injectable()
export class AuthService {

  getOtp(phoneNumber: string) {
    const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l');

    sdk.post('/v2/otp/request', { key: '', secret: '', msisdn: phoneNumber }, {Accept: 'application/json'})
      .then(res => {return res})
      .catch(err => console.error(err));
  }

  verifyOtp(key: string, secret: string, token: string, pin: string) {
    const sdk = require('api')('@thaibulksms/v1.0#3s3hunt2tktwn9w2l');

    sdk.post('/v2/otp/verify', {
      key: key,
      secret: secret,
      token: token,
      pin: pin
    }, {Accept: 'application/json'})
    .then(res => {return res})
    .catch(err => console.error(err));
  }
}