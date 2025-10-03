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
    @Body('folder') folder?: string
  ): Promise<UploadResult> {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadService.uploadFile(file, folder);
  }

  @Post('multiple')
  @UseInterceptors(FilesInterceptor('files', 10)) // máximo 10 arquivos
  async uploadMultipleFiles(
    @UploadedFiles() files: Express.Multer.File[],
    @Body('folder') folder?: string
  ): Promise<UploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    return this.uploadService.uploadMultipleFiles(files, folder);
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