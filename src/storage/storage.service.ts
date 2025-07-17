
import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { join } from 'path';
import { UploadApiErrorResponse, UploadApiResponse } from 'cloudinary';
import { AppConfig } from 'src/config.schema';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { File as MulterFile } from 'multer';

@Injectable()
export class StorageService {


    constructor(private readonly cloudinaryService: CloudinaryService) {}

  // private readonly storagePath = join(
  //   __dirname,
  //   '..',
  //   '..',
  //   '..',
  //   '..',
  //   'assets',
  //   'storage',
  // );

  getImageUrl(filename: string): string {
    return `${AppConfig.IMAGE_BASE_URL}/${filename}`;
  }

  async uploadImage(file: MulterFile): Promise<string> {
    try {
      const filePath = join(file.path);
      const result: UploadApiResponse | UploadApiErrorResponse =
        await this.cloudinaryService.uploadImage(
          filePath,
          'cropxchange', // Specify a folder if needed
        );

      console.log(result);
      if ('error' in result) {
        throw new InternalServerErrorException(result.error.message);
      }

      return result.secure_url;
    } catch (error) {
      console.log(error)
      throw new InternalServerErrorException('Failed to upload image');
    }
  }
}
