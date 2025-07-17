import {
  MiddlewareConsumer,
  Module,
  NestMiddleware,
  RequestMethod,
} from '@nestjs/common';
import { ProductRepository } from './schema/product.repository';
import { MongooseModule } from '@nestjs/mongoose';
import {
  Product,
  ProductDailyPrices,
  ProductDailyPricesSchema,
  ProductNews,
  ProductNewsSchema,
  ProductSchema,
  ProductSubscription,
  ProductSubscriptionSchema,
} from './schema/product.schema';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { ImageStorage } from 'src/common/services/image.service';
import { ProductsNewsController } from './product-news.controller';
import { ProductsNewsService } from './product-news.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: ProductSubscription.name, schema: ProductSubscriptionSchema },
      { name: ProductNews.name, schema: ProductNewsSchema },
      { name: ProductDailyPrices.name, schema: ProductDailyPricesSchema },
    ]),
  ],
  controllers: [ProductsNewsController],
  providers: [ProductsNewsService, ProductRepository, ImageStorage],
})
export class ProductsNewsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: '*/products/inc', method: RequestMethod.POST },
        { path: '*/products/inc', method: RequestMethod.PATCH },
        { path: '*/products/news', method: RequestMethod.POST },
        { path: '*/products/news', method: RequestMethod.PATCH },
        { path: '*/price', method: RequestMethod.PATCH },
        { path: '*/prices', method: RequestMethod.POST },
        { path: '*/subscription', method: RequestMethod.POST },
        { path: '*/subscription', method: RequestMethod.DELETE },
        { path: '*/subscription', method: RequestMethod.GET},
      );
  }
}
