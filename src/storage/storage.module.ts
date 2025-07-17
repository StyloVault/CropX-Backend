import { Module } from '@nestjs/common';
import { StorageService } from './storage.service';
import { StorageController } from './storage.controller';
import { CloudinaryService } from 'src/common/services/cloudinary.service';
import { Mongoose } from 'mongoose';

@Module({
  imports: [
  ],
  controllers: [StorageController],
  providers: [StorageService, CloudinaryService],
})
export class StorageModule {}
