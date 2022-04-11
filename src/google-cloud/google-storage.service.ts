import { Bucket, Storage } from '@google-cloud/storage';
import { Injectable } from '@nestjs/common';
import * as CryptoJS from 'crypto-js';
import path from 'path';
import { Transform } from 'stream';
import { BucketName } from './google-cloud.interface';

@Injectable()
export class GoogleCloudStorage {
  private storage: Storage;
  constructor() {
    this.storage = new Storage();
  }

  public async uploadImage(uid: number, img: Buffer, bucketName: BucketName, uniqueId?: string ): Promise<string> {
    const imgStream = new Transform.PassThrough();
    const imgName = await this.getImageFileName(uid, bucketName, uniqueId);
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
    return await this.getImageURL(imgName, bucketName);
  }

  private getImageURL(imgName: string, bucketName: string): string {
    return `${process.env.GCS_PUBLIC_URL}/${bucketName}/${imgName}`;
  }

  private async getImageFileName(uid: number, bucketName: string, uniqueId?: string): Promise<string> {
    let imageName;
    if(uniqueId){
      imageName = CryptoJS.SHA256(uid.toString() + bucketName + uniqueId).toString();
    }else{
      imageName = CryptoJS.SHA256(uid.toString() + bucketName).toString();
    }
    
    return `profile-${uid}-${imageName}.jpg`;
  }
}
