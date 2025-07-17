import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'products' })
export class Product {
  @Prop({ type: String, required: true })
  productName: string;

  @Prop({ type: String, required: true, unique: true })
  commonName: string;

  @Prop({ type: String, required: true })
  productImage: string;

  @Prop({ type: String, required: true })
  productLocation: string;

  @Prop({ type: Boolean, default: true })
  availabilityStatus: boolean;

  @Prop({ type: String, required: true })
  productDescription: string;

  @Prop({ type: String, required: true })
  unitOfMeasure: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

@Schema({ timestamps: true, collection: 'product_news' })
export class ProductNews {
  @Prop({ type: Types.ObjectId, ref: 'Product' })
  product: Types.ObjectId;

  @Prop({ type: String, required: true })
  newsTopic: string;

  @Prop({ type: String })
  newsSubTopic: string;

  @Prop({ type: String })
  newsBody: string;

  @Prop([{ type: String }])
  images: string[];

  @Prop({ type: String, required: true })
  author: string;

  @Prop({ type: String })
  externalLink: string;

  @Prop({ type: Object })
  metadata: object;
}

export const ProductNewsSchema = SchemaFactory.createForClass(ProductNews);

@Schema({ timestamps: true, collection: 'product_daily_prices' })
export class ProductDailyPrices {
  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({
    type: Number,
    get: (v) => (v / 100).toFixed(2),
    set: (v) => v * 100,
    default: 0,
    required: true,
  })
  currentPrice: number;

  @Prop({ type: Types.ObjectId, ref: 'ProductNews' })
  relatedNews: Types.ObjectId;
}

export const ProductDailyPricesSchema =
  SchemaFactory.createForClass(ProductDailyPrices);

ProductDailyPricesSchema.set('toObject', { getters: true });
ProductDailyPricesSchema.set('toJSON', { getters: true });

@Schema({ timestamps: true, collection: 'product_subscriptions' })
export class ProductSubscription {
  @Prop({ type: Types.ObjectId, required: true })
  userId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Product', required: true })
  product: Types.ObjectId;

  @Prop({ type: Boolean, default: true })
  activeStatus: boolean;
}

export const ProductSubscriptionSchema =
  SchemaFactory.createForClass(ProductSubscription);
