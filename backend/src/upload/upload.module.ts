import { Module } from '@nestjs/common';
import { UploadService } from './upload.service';
import { UploadController } from './upload.controller';
import { AwsS3Module } from 'src/aws-s3/aws-s3.module';

@Module({
  imports: [AwsS3Module],
  providers: [UploadService],
  controllers: [UploadController]
})
export class UploadModule {}
