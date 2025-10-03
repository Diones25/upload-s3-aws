import {
  Controller,
  Post,
  Delete,
  Put,
  Param,
  Body,
  UploadedFile,
  UploadedFiles,
  UseInterceptors,
  BadRequestException,
  Get,
  Query,
} from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { UploadService } from './upload.service';
import { UploadResult } from './interfaces/upload-result.interface';
import { FileUpload } from './decorators/file-validation.decorator';

@Controller('upload')
export class UploadController {
  constructor(private readonly uploadService: UploadService) { }

  @Post('single')
  @FileUpload('file', true)
  async uploadSingleFile(
    @UploadedFile() file: Express.Multer.File,
    @Body('folder') folder?: string,
    @Body('signedUrlExpires') signedUrlExpires?: number
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadService.uploadFile(file, {
      folder,
      signedUrlExpires: signedUrlExpires ? parseInt(signedUrlExpires.toString()) : undefined
    });
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // máximo 10 arquivos
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string,
    @Body('signedUrlExpires') signedUrlExpires?: number
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadService.uploadMultipleFiles(files, {
      folder,
      signedUrlExpires: signedUrlExpires ? parseInt(signedUrlExpires.toString()) : undefined
    });
  }

  /*
  * Gera uma URL assinada para download do arquivo
  */ 
  @Get('signed-url/:key')
  async getSignedUrl(
    @Param('key') key: string,
    @Query('expiresIn') expiresIn?: string
  ): Promise<{ url: string; expiresAt: Date }> {
    if (!key) {
      throw new BadRequestException('Key do arquivo é obrigatória');
    }

    const expiresInSeconds = expiresIn ? parseInt(expiresIn) : undefined;

    if (expiresInSeconds) {
      const url = await this.uploadService.getSignedUrlWithCustomExpiry(key, expiresInSeconds);
      const expiresAt = new Date();
      expiresAt.setSeconds(expiresAt.getSeconds() + expiresInSeconds);
      return { url, expiresAt };
    } else {
      return this.uploadService.getFileUrl(key);
    }
  }

  @Delete(':key')
  async deleteFile(@Param('key') key: string): Promise<{ message: string }> {
    await this.uploadService.deleteFile(key);
    return { message: 'Arquivo deletado com sucesso' };
  }

  @Put(':key')
  @UseInterceptors(FileInterceptor('file'))
  async updateFile(
    @Param('key') key: string,
    @UploadedFile() file: Express.Multer.File
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadService.updateFile(key, file);
  }
}