import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { S3Client, PutObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { UploadResult } from './interfaces/upload-result.interface';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly logger = new Logger(UploadService.name);

  constructor(private configService: ConfigService) {
    // Configuração do cliente S3
    this.s3 = new S3Client({
      region: this.configService.get<string>('AWS_REGION'),
      credentials: {
        accessKeyId: this.configService.get<string>('AWS_ACCESS_KEY_ID')!,
        secretAccessKey: this.configService.get<string>('AWS_SECRET_ACCESS_KEY')!,
      },
    });
    this.bucketName = this.configService.get<string>('AWS_S3_BUCKET_NAME')!;

    if (!this.bucketName) {
      throw new Error('AWS_S3_BUCKET_NAME não está definido nas variáveis de ambiente');
    }

    this.logger.log(`Bucket Name: ${this.bucketName}`);
    this.logger.log(`AWS Region: ${process.env.AWS_REGION}`);
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = 'uploads'
  ): Promise<UploadResult> {
    try {

      if (!file) {
        throw new BadRequestException('Nenhum arquivo fornecido');
      }

      const timestamp = Date.now();
      const randomString = Math.random().toString(36).substring(2, 15);
      const fileExtension = file.originalname.split('.').pop();
      const filename = `${timestamp}-${randomString}.${fileExtension}`;
      const key = `${folder}/${filename}`;

      // Configuração do upload para S3
      const command = new PutObjectCommand({
        Bucket: this.bucketName,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        //ACL: 'public-read', // ou 'private' conforme necessidade
        Metadata: {
          originalname: file.originalname,
        },
      });

      const result = await this.s3.send(command);

      // Constrói a URL do arquivo
      const region = process.env.AWS_REGION || 'us-east-1';
      const url = `https://${this.bucketName}.s3.${region}.amazonaws.com/${key}`;

      return {
        url,
        key,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bucket: this.bucketName,
        etag: result.ETag || '',
      };
    } catch (error) {
      throw new BadRequestException(`Erro no upload: ${error.message}`);
    }
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    folder: string = 'uploads'
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, folder));
    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);
    } catch (error) {
      throw new BadRequestException(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  async updateFile(
    key: string,
    file: Express.Multer.File
  ): Promise<UploadResult> {
    // Deleta o arquivo antigo
    await this.deleteFile(key);

    // Faz upload do novo arquivo
    const folder = key.split('/')[0];
    return this.uploadFile(file, folder);
  }
}
