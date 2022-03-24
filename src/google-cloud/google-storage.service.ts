import { Bucket, Storage } from '@google-cloud/storage'
import { Injectable, StreamableFile } from '@nestjs/common'
import * as CryptoJS from 'crypto-js'

@Injectable()
export class GoogleCloudStorage {
  private bucket: Bucket
  private bucketName: string
  private storage: Storage
  constructor() {
    this.storage = new Storage()
    this.bucketName = 'aegis-user-profile'
    this.bucket = this.storage.bucket(this.bucketName)
  }

  public async uploadImage(uid: number, img: Buffer): Promise<string> {
    const imgStream = new StreamableFile(img)
    const imgName = await this.getImageFileName(uid)
    const file = this.bucket.file(imgName)
    await imgStream
      .getStream()
      .pipe(file.createWriteStream())
      .on('error', (err) => {
        throw new Error(err.message)
      })
    return await this.getImageURL(imgName)
  }

  private getImageURL(imgName: string): string {
    return process.env.GCS_PUBLIC_URL + '/' + imgName
  }
  private async getImageFileName(uid: number): Promise<string> {
    const imageName = CryptoJS.SHA256(uid.toString() + this.bucketName).toString()
    return `profile-${uid}-${imageName}.jpg`
  }
}
