import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import {
  S3Client,
  PutObjectCommand,
  DeleteObjectCommand,
  GetObjectCommand
} from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { UploadResult } from './interfaces/upload-result.interface';
import { ConfigService } from '@nestjs/config';

export interface UploadOptions {
  folder?: string;
  signedUrlExpires?: number; 
}

@Injectable()
export class UploadService {
  private readonly s3: S3Client;
  private readonly bucketName: string;
  private readonly defaultSignedUrlExpires: number = 3600; 
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
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    try {

      if (!file) {
        throw new BadRequestException('Nenhum arquivo fornecido');
      }

      const {
        folder = 'uploads',
        signedUrlExpires = this.defaultSignedUrlExpires
      } = options;

      // Gera a key do arquivo
      const key = this.generateFileName(file.originalname, folder);

      this.logger.log(`Upload para: ${key}`);

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

      // Executa o upload
      const result = await this.s3.send(command);

      // Gera URL assinada para acesso temporário
      const signedUrl = await this.generateSignedUrl(key, signedUrlExpires);

      const expirationDate = new Date();
      expirationDate.setSeconds(expirationDate.getSeconds() + signedUrlExpires);

      this.logger.log(`Upload realizado com sucesso`);
      this.logger.log(`URL assinada expira em: ${expirationDate}`);

      return {
        url: signedUrl,
        key,
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        bucket: this.bucketName,
        etag: result.ETag || '',
        signedUrlExpires: expirationDate,
      };
    } catch (error) {
      throw new BadRequestException(`Erro no upload: ${error.message}`);
    }
  }

  async generateSignedUrl(
    key: string,
    expiresIn: number = this.defaultSignedUrlExpires
  ): Promise<string> {
    try {
      const command = new GetObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      const signedUrl = await getSignedUrl(this.s3, command, {
        expiresIn
      });

      this.logger.log(`URL assinada gerada para: ${key}`);
      this.logger.log(`Expira em: ${expiresIn} segundos`);

      return signedUrl;
    } catch (error) {
      this.logger.error(`Erro ao gerar URL assinada: ${error.message}`);
      throw new BadRequestException(`Erro ao gerar URL assinada: ${error.message}`);
    }
  }

  async getFileUrl(key: string): Promise<{ url: string; expiresAt: Date }> {
    const expiresIn = this.defaultSignedUrlExpires;
    const url = await this.generateSignedUrl(key, expiresIn);

    const expiresAt = new Date();
    expiresAt.setSeconds(expiresAt.getSeconds() + expiresIn);

    return { url, expiresAt };
  }

  // Método para gerar URL assinada com tempo customizado
  async getSignedUrlWithCustomExpiry(
    key: string,
    expiresInSeconds: number
  ): Promise<string> {
    return this.generateSignedUrl(key, expiresInSeconds);
  }

  async uploadMultipleFiles(
    files: Express.Multer.File[],
    options: UploadOptions = {}
  ): Promise<UploadResult[]> {
    const uploadPromises = files.map(file => this.uploadFile(file, options));
    return Promise.all(uploadPromises);
  }

  async deleteFile(key: string): Promise<void> {
    try {
      const command = new DeleteObjectCommand({
        Bucket: this.bucketName,
        Key: key,
      });

      await this.s3.send(command);
      this.logger.log(`Arquivo deletado: ${key}`);
    } catch (error) {
      this.logger.error(`Erro ao deletar arquivo: ${error.message}`);
      throw new BadRequestException(`Erro ao deletar arquivo: ${error.message}`);
    }
  }

  async updateFile(
    key: string,
    file: Express.Multer.File,
    options: UploadOptions = {}
  ): Promise<UploadResult> {
    let oldFileDeleted = false;

    try {
      if (!file) {
        throw new BadRequestException('Nenhum arquivo fornecido para atualização');
      }

      this.logger.log(`Iniciando atualização do arquivo: ${key}`);

      // Extrai o folder da key existente
      const folder = key.split('/')[0];

      // Primeiro faz upload do novo arquivo
      const uploadOptions: UploadOptions = {
        ...options,
        folder: options.folder || folder,
      };

      const newFileResult = await this.uploadFile(file, uploadOptions);

      // Se o upload do novo arquivo foi bem-sucedido, deleta o antigo
      await this.deleteFile(key);
      oldFileDeleted = true;

      this.logger.log(`Arquivo atualizado com sucesso. Nova key: ${newFileResult.key}`);

      return newFileResult;

    } catch (error) {
      this.logger.error(`Erro na atualização do arquivo: ${error.message}`);

      // Se deletou o arquivo antigo mas falhou no upload do novo, temos um problema
      if (oldFileDeleted) {
        this.logger.error('Arquivo antigo foi deletado mas novo upload falhou!');
        throw new BadRequestException('Erro crítico: arquivo anterior foi perdido durante a atualização');
      }

      throw new BadRequestException(`Erro ao atualizar arquivo: ${error.message}`);
    }
  }

  private generateFileName(originalName: string, folder: string): string {
    const timestamp = Date.now();
    const randomString = Math.random().toString(36).substring(2, 15);
    const fileExtension = originalName.split('.').pop();
    const sanitizedName = originalName.split('.')[0].replace(/[^a-zA-Z0-9]/g, '-');
    const filename = `${sanitizedName}-${timestamp}-${randomString}.${fileExtension}`;
    return `${folder}/${filename}`;
  }
}
