import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import path from 'path';
import { Transform } from 'stream';

@Injectable()
export class GoogleCloudStorage {
  private storage: Storage;
  constructor() {
    this.storage = new Storage();

  }

  public async uploadImage(uid: number, img: Buffer, bucketName: string): Promise<string> {
    const imgStream = new Transform.PassThrough();
    const imgName = await this.getImageFileName(uid, bucketName);
    const bucket = this.storage.bucket(bucketName);
    const file = bucket.file(imgName);
    imgStream
      .pipe(
        file.createWriteStream({
          metadata: {
            cacheControl: 'private, max-age=0, no-transform',
          },
        })
      )
      .on('error', (err) => {
        throw new Error(err.message);
      });
    imgStream.end(img);
    return await this.getImageURL(imgName);
  }

  private getImageURL(imgName: string): string {
    return process.env.GCS_PUBLIC_URL + '/' + imgName;
  }
  private async getImageFileName(uid: number, bucketName: string): Promise<string> {
    const imageName = CryptoJS.SHA256(uid.toString() + bucketName).toString();
    return `profile-${uid}-${imageName}.jpg`;
  }
}
