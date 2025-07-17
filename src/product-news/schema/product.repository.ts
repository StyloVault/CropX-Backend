import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import {
  ProductDailyPricesInterface,
  ProductInterface,
  ProductNewsInterface,
  ProductSubscriptionInterface,
} from '../interface/product.interface';
import {
  Product,
  ProductDailyPrices,
  ProductNews,
  ProductSubscription,
} from './product.schema';
import Bugsnag from '@bugsnag/js';

@Injectable()
export class ProductRepository {
  constructor(
    @InjectModel(Product.name) private productModel: Model<ProductInterface>,
    @InjectModel(ProductDailyPrices.name)
    private productDailyPriceModel: Model<ProductDailyPricesInterface>,
    @InjectModel(ProductNews.name)
    private productNewsModel: Model<ProductNewsInterface>,
    @InjectModel(ProductSubscription.name)
    private productSubscriptionModel: Model<ProductSubscriptionInterface>,
  ) {}

  async addProduct(data) {
    return await new this.productModel(data).save();
  }

  async fetchProduct(data, query) {
    try {
      const subUser = this.productModel.find(data);
      let { page, limit } = query;
      page = Number(page) || 1;
      limit = Number(limit) || 50;
      const skip = (page - 1) * limit;
  
      const userData: any[] = []; // ideally type this properly
  
      const output = await subUser.skip(skip).limit(limit).sort('-createdAt');
  
      for (const item of output) {
        const latestPrice = await this.productDailyPriceModel
          .findOne({ product: item._id.toString() })
          .sort('-createdAt');
  
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const startOfDay = new Date(yesterday.setHours(0, 0, 0, 0));
        const endOfDay = new Date(yesterday.setHours(23, 59, 59, 999));
  
        const yesterdayPrice = await this.productDailyPriceModel.findOne({
          product: item._id.toString(),
          createdAt: { $gte: startOfDay, $lt: endOfDay },
        });
  
        let changes: 'up' | 'down' | 'no_change' = 'no_change';
  
        if (latestPrice && yesterdayPrice) {
          if (latestPrice.currentPrice > yesterdayPrice.currentPrice) {
            changes = 'up';
          } else if (latestPrice.currentPrice < yesterdayPrice.currentPrice) {
            changes = 'down';
          }
        }
  
        userData.push({
          ...item.toObject(),
          price: latestPrice || null,
          changes,
        });
      }
  
      const totalNum = await this.productModel.where(data).count();
      const numOfPages = Math.ceil(totalNum / limit);
  
      return {
        statusCode: 200,
        message: 'Requested Users fetched successfully',
        data: userData,
        totalNum,
        numOfPages,
      };
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
      throw new InternalServerErrorException('Unable to process transaction');
    }
  }
  

  async getSingleProduct(data) {
    return await this.productModel.findOne(data).exec();
  }

  async updateProduct(search, data) {
    return await this.productModel.findOneAndUpdate(search, data, {
      new: true,
    });
  }

  async createNews(data) {
    return await new this.productNewsModel(data).save();
  }

  async getNews(data, query) {
    try {
      const subUser = this.productNewsModel.find(data).populate('product');
      let { page, limit } = query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const skip = (page - 1) * limit;

      // const userData = [];
      const userData = await subUser.skip(skip).limit(limit).sort('-createdAt');

     
      const totalNum = await this.productNewsModel.where(data).count();

      const numOfPages = Math.ceil(totalNum / limit);

      return {
        statusCode: 200,
        message: 'Requested Users fetched successfully',
        data: userData,
        totalNum,
        numOfPages,
      };
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
      throw new InternalServerErrorException('Unable to process transaction');
    }
  }

  async getSingleNews(data) {
    return await this.productNewsModel.findOne(data).populate('product').exec();
  }

  async updateNews(search, data) {
    return await this.productModel.findOneAndUpdate(search, data, {
      new: true,
    });
  }

  async createDailyPrice(data) {
    return await new this.productDailyPriceModel(data).save();
  }

  async updateDailyPrice(search, data) {
    return await this.productDailyPriceModel
      .findOneAndUpdate(search, data, { now: true })
      .exec();
  }

  async fetchSingleDailyPrice(data) {
    return await this.productDailyPriceModel.findOne(data).exec();
  }

  // async fetchMultipleDailyPrice(data, query) {
  //   try {
  //     const subUser = this.productDailyPriceModel
  //       .find(data)
  //       .populate('product');
  //     let { page, limit } = query;
  //     page = Number(page) || 1;
  //     limit = Number(limit) || 10;
  //     const skip = (page - 1) * limit;

  //     const userData = [];
  //     const output = await subUser.skip(skip).limit(limit).sort('-createdAt');

  //     for (const item of output) {
  //       userData.push(item);
  //     }
  //     const totalNum = await this.productDailyPriceModel.where(data).count();

  //     const numOfPages = Math.ceil(totalNum / limit);

  //     return {
  //       statusCode: 200,
  //       message: 'Requested Users fetched successfully',
  //       data: userData,
  //       totalNum,
  //       numOfPages,
  //     };
  //   } catch (error) {
  //     console.log(error);
  //     Bugsnag.notify(error);
  //     throw new InternalServerErrorException('Unable to process transaction');
  //   }
  // }

  async fetchMultipleDailyPrice(data, query) {
    try {
      const subUser = this.productDailyPriceModel
        .find(data)
        .populate('product');
  
      let { page, limit } = query;
      page = Number(page) || 1;
      limit = Number(limit) || 10;
      const skip = (page - 1) * limit;
  
      const userData: any[] = [];
  
      const output = await subUser.skip(skip).limit(limit).sort('-createdAt');
  
      for (const item of output) {
        const productId = item?.product?._id?.toString();
  
        const yesterday = new Date();
        const startOfYesterday = new Date(
          yesterday.setDate(yesterday.getDate() - 1)
        );
        startOfYesterday.setHours(0, 0, 0, 0);
  
        const endOfYesterday = new Date(startOfYesterday);
        endOfYesterday.setHours(23, 59, 59, 999);
  
        const yesterdayPrice = await this.productDailyPriceModel.findOne({
          product: productId,
          createdAt: {
            $gte: startOfYesterday,
            $lt: endOfYesterday,
          },
        });
  
        // Determine changes
        let changes: 'up' | 'down' | 'no_change' = 'no_change';
  
        if (yesterdayPrice) {
          if (item.currentPrice > yesterdayPrice.currentPrice) {
            changes = 'up';
          } else if (item.currentPrice < yesterdayPrice.currentPrice) {
            changes = 'down';
          }
        }
  
        userData.push({
          ...item.toObject(),
          changes,
        });
      }
  
      const totalNum = await this.productDailyPriceModel.where(data).count();
      const numOfPages = Math.ceil(totalNum / limit);
  
      return {
        statusCode: 200,
        message: 'Requested prices fetched successfully',
        data: userData,
        totalNum,
        numOfPages,
      };
    } catch (error) {
      console.log(error);
      Bugsnag.notify(error);
      throw new InternalServerErrorException('Unable to process transaction');
    }
  }
  

  async addProductSubscription(data) {
    return await new this.productSubscriptionModel(data).save();
  }

  async fetchProductSubscription(search) {
    const output = await this.productSubscriptionModel
      .find(search)
      .populate('product')
      .exec();
  
    const userData: any[] = [];
  
    for (const item of output) {
      const productId = item?.product?._id?.toString();
  
      if (!productId) continue;
  
      // Get the latest price
      const latestPrice = await this.productDailyPriceModel
        .findOne({ product: productId })
        .sort('-createdAt');
  
      // Get yesterday's start and end timestamps
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
  
      const startOfYesterday = new Date(yesterday);
      startOfYesterday.setHours(0, 0, 0, 0);
  
      const endOfYesterday = new Date(yesterday);
      endOfYesterday.setHours(23, 59, 59, 999);
  
      const yesterdayPrice = await this.productDailyPriceModel.findOne({
        product: productId,
        createdAt: {
          $gte: startOfYesterday,
          $lt: endOfYesterday,
        },
      });
  
      // Determine price movement
      let changes: 'up' | 'down' | 'no_change' = 'no_change';
      if (latestPrice && yesterdayPrice) {
        if (latestPrice.currentPrice > yesterdayPrice.currentPrice) {
          changes = 'up';
        } else if (latestPrice.currentPrice < yesterdayPrice.currentPrice) {
          changes = 'down';
        }
      }
  
      userData.push({
        ...item.toObject(),
        price: latestPrice ?? null,
        changes,
      });
    }
  
    return userData;
  }
  

  async updateProductSubscription(search) {
    return this.productSubscriptionModel.deleteOne(search).exec();
  }

  async setDailyProductPrice() {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const startOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
    );
    const endOfYesterday = new Date(
      yesterday.getFullYear(),
      yesterday.getMonth(),
      yesterday.getDate(),
      23,
      59,
      59,
    );

    const yesterdayProducts = await this.productDailyPriceModel.find({
      createdAt: {
        $gte: startOfYesterday,
        $lt: endOfYesterday,
      },
    });
    console.log(yesterdayProducts);
    const todayProducts = yesterdayProducts.map((product) => {
      return { product: product.product, currentPrice: product.currentPrice };
    });

    for (const product of todayProducts) {
      //Check if the product has not been registered for today;
      const today = new Date();
      today.setHours(0, 0, 0);
      const existProduct = await this.productDailyPriceModel.findOne({
        product: product.product,
        createdAt: { $gte: today },
      });
      if (!existProduct) {
        await new this.productDailyPriceModel(product).save();
      }
    }
  }

  // async getProductGraphData(
  //   productId: string,
  //   interval: string,
  //   duration: number,
  // ) {
  //   const aggregationPipeline: any[] = [];

  //   // Match documents for the specified product
  //   aggregationPipeline.push({
  //     $match: { product: productId },
  //   });

  //   // Project the necessary fields
  //   aggregationPipeline.push({
  //     $project: {
  //       date: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
  //       currentPrice: 1,
  //     },
  //   });

  //   // Group by the specified time interval
  //   const groupField =
  //     interval === 'yearly'
  //       ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
  //       : interval === 'monthly'
  //       ? '$date'
  //       : { $dateToString: { format: '%Y-%U', date: '$createdAt' } };
  //   aggregationPipeline.push({
  //     $group: {
  //       _id: groupField,
  //       averagePrice: { $avg: '$currentPrice' },
  //     },
  //   });

  //   // Sort the results by date
  //   aggregationPipeline.push({
  //     $sort: { _id: -1 },
  //   });

  //   // Limit the results to the specified duration
  //   aggregationPipeline.push({
  //     $limit: duration ? Number(duration) : 12,
  //   });

  //   // Execute the aggregation pipeline
  //   const result = await this.productDailyPriceModel.aggregate(
  //     aggregationPipeline,
  //   );

  //   return result.reverse(); // Reverse the order to get ascending dates
  // }

  async getProductGraphData(productId, interval) {
    const aggregationPipeline: any[] = [];

    // Match documents for the specified product
    aggregationPipeline.push({
      $match: { product: productId },
    });

    // Project the necessary fields
    aggregationPipeline.push({
      $project: {
        date: {
          $dateToString: {
            format:
              interval === 'daily'
                ? '%Y-%m-%d'
                : interval === 'weekly'
                ? '%Y-W%U'
                : interval === 'monthly'
                ? '%Y-%m'
                : '%Y',
            date: '$createdAt',
          },
        },
        currentPrice: 1,
      },
    });

    // Group by the specified time interval
    const groupField =
      interval === 'yearly'
        ? { $dateToString: { format: '%Y', date: '$createdAt' } }
        : interval === 'monthly'
        ? { $dateToString: { format: '%Y-%m', date: '$createdAt' } }
        : interval === 'weekly'
        ? { $dateToString: { format: '%Y-W%U', date: '$createdAt' } }
        : '$date';
    aggregationPipeline.push({
      $group: {
        _id: groupField,
        averagePrice: { $avg: '$currentPrice' },
      },
    });

    // Sort the results by date
    aggregationPipeline.push({
      $sort: { _id: 1 },
    });

    // Limit the results based on the specified interval
    aggregationPipeline.push({
      $limit: 12,
    });

    // Execute the aggregation pipeline
    return await this.productDailyPriceModel.aggregate(aggregationPipeline);
  }
}
