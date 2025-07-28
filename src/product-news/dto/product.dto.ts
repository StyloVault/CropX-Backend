import {
  IsArray,
  IsBoolean,
  IsMongoId,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
import { Types } from 'mongoose';

export class NewProductDto {
  @IsString()
  productName: string;

  @IsString()
  commonName: string;

  @IsString()
  productImage: string;

  @IsString()
  productLocation: string;

  availabilityStatus: boolean;

  @IsBoolean()
  @IsOptional()
  isMonitored?: boolean;

  @IsString()
  unitOfMeasure: string;
}

export class NewProductNewsDto {
  @IsMongoId()
  product: Types.ObjectId;

  @IsString()
  newsTopic: string;

  newsSubTopic: string;

  @IsString()
  newsBody: string;

  @IsArray()
  images: any;

  @IsString()
  author: string;

  externalLink: string;

  metaData: string;
}

export class UpdateProductNewsDto {
  @IsString()
  newsTopic: string;

  newsSubTopic: string;

  @IsString()
  newsBody: string;

  images: any;

  @IsString()
  author: string;

  externalLink: string;
}

export class NewProductSubscription {
  @IsMongoId()
  userId: Types.ObjectId;

  @IsMongoId()
  product: Types.ObjectId;

  @IsBoolean()
  activeStatus: boolean;
}

export class NewProductPriceDto {
  @IsMongoId()
  productId: Types.ObjectId;
  @IsString()
  currentPrice: Types.ObjectId;

}
