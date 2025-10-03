import { applyDecorators, BadRequestException, UseInterceptors } from '@nestjs/common';
import { FileInterceptor, FilesInterceptor } from '@nestjs/platform-express';
import { MulterOptions } from '@nestjs/platform-express/multer/interfaces/multer-options.interface';

export function FileUpload(
  fieldName: string = 'file',
  required: boolean = false,
  maxCount: number = 1
) {
  return applyDecorators(
    UseInterceptors(
      maxCount > 1
        ? FilesInterceptor(fieldName, maxCount, fileFilter())
        : FileInterceptor(fieldName, fileFilter())
    )
  );
}

function fileFilter(): MulterOptions {
  return {
    limits: {
      fileSize: 10 * 1024 * 1024, // 10MB
    },
    fileFilter: (req, file, callback) => {
      // Validação de tipo de arquivo
      const allowedMimes = [
        'image/jpeg',
        'image/png',
        'image/gif',
        'application/pdf',
        'text/plain',
      ];

      if (!allowedMimes.includes(file.mimetype)) {
        return callback(
          new BadRequestException('Tipo de arquivo não permitido'),
          false
        );
      }

      callback(null, true);
    },
  };
}