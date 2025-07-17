import { Document, Types } from 'mongoose';

export class ProductInterface extends Document {
  productName: string;
  commonName: string;
  productImage: string;
  productLocation: string;
  availabilityStatus: boolean;
}

export class ProductNewsInterface extends Document {
  product: any;
  newsTopic: string;
  newsSubTopic: string;
  newsBody: string;
  images: any;
  author: string;
  externalLink: string;
  metadata: string;
}

export class ProductDailyPricesInterface extends Document {
  product: any;
  currentPrice: number;
  relatedNews: any;
}

export class ProductSubscriptionInterface extends Document {
  userId: Types.ObjectId;
  product: any;
  activeStatus: boolean;
}
