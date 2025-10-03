import { S3Client } from '@aws-sdk/client-s3';
import { Module } from '@nestjs/common';

@Module({
  providers: [
    {
      provide: 'S3_CLIENT',
      useFactory: () => {
        const region = process.env.AWS_REGION;
        const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
        const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

        if (!region || !accessKeyId || !secretAccessKey) {
          throw new Error('Missing AWS S3 configuration environment variables.');
        }

        return new S3Client({
          region,
          credentials: {
            accessKeyId,
            secretAccessKey
          },
        });
      }
    }
  ],
})
export class AwsS3Module { }
