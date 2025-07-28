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
import { AiNewsService } from './ai-news.service';
import { OpenAIService } from '../common/services/openai.service';
import { ProductScraperService } from './scraper.service';
import { CronJob } from './internal/cron';

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
  providers: [
    ProductsNewsService,
    ProductRepository,
    ImageStorage,
    OpenAIService,
    AiNewsService,
    ProductScraperService,
    CronJob,
  ],
})
export class ProductsNewsModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(
        { path: 'api/v1/products/inc', method: RequestMethod.POST },
        { path: 'api/v1/products/inc', method: RequestMethod.PATCH },
        { path: 'api/v1/products/news', method: RequestMethod.POST },
        { path: 'api/v1/products/news', method: RequestMethod.PATCH },
        { path: 'api/v1/price', method: RequestMethod.PATCH },
        { path: 'api/v1/prices', method: RequestMethod.POST },
        { path: 'api/v1/subscription', method: RequestMethod.POST },
        { path: 'api/v1/subscription', method: RequestMethod.DELETE },
        { path: 'api/v1/subscription', method: RequestMethod.GET},
      );
  }
}
