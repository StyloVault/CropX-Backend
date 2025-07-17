
import { StorageService } from './storage.service';
import {
  BadRequestException,
  Controller,
  Get,
  InternalServerErrorException,
  Param,
  Post,
  Res,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import * as path from 'path';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { existsSync, mkdirSync } from 'fs';
import { File as MulterFile } from 'multer';

const storagePath = './uploads';

@Controller('storage')
export class StorageController {
  constructor(private readonly storageService: StorageService) {}


  @Post('upload')
  @UseInterceptors(
    FileInterceptor('file', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          console.log('Request', req, file);
          if (!existsSync(storagePath)) {
            console.log('Storage Path', storagePath);
            mkdirSync(storagePath, { recursive: true });
          }
          cb(null, storagePath);
        },
        filename: (req, file, cb) => {
          const randomName = Array(32)
            .fill(null)
            .map(() => Math.round(Math.random() * 16).toString(16))
            .join('');
          cb(null, `${randomName}${extname(file.originalname)}`);
        },
      }),
      fileFilter: (req, file, cb) => {
        console.log('Req', file);
        if (!file.mimetype.match(/\/(jpg|jpeg|png|gif|octet-stream)$/)) {
          cb(new BadRequestException('Only image files are allowed!'), false);
        } else {
          cb(null, true);
        }
      },
    }),
  )
  async uploadFileN(@UploadedFile() file: MulterFile) {
    if (!file) {
      throw new BadRequestException('File is required');
    }

    try {
      const url = await this.storageService.uploadImage(file);
      return { url };
    } catch (error) {
      throw new InternalServerErrorException(
        'Failed to upload image to Cloudinary',
      );
    }
  }

  @Get(':filename')
  getImage(@Param('filename') filename: string, @Res() res) {
    const imagePath = path.join(
      __dirname,
      '..',
      '..',
      '..',
      '..',
      'assets',
      'storage',
      filename,
    );
    res.sendFile(imagePath);
    // res.sendFile(filename, { root: 'assets/storage/' });
  }
}
