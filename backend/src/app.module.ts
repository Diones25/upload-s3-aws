import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AwsS3Module } from './aws-s3/aws-s3.module';
import { UploadModule } from './upload/upload.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    AwsS3Module,
    UploadModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
