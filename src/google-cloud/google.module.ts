import { Module } from '@nestjs/common';

import { GoogleCloudStorage } from 'src/google-cloud/google-storage.service';

@Module({
  providers: [GoogleCloudStorage],
  exports: [GoogleCloudStorage],
})
export class GoogleModule {}
