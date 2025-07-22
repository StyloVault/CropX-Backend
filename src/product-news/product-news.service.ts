import {
    Injectable,
    InternalServerErrorException,
    NotFoundException,
    UnprocessableEntityException,
  } from '@nestjs/common';
  import { Types } from 'mongoose';
  import {
    NewProductDto,
    NewProductNewsDto,
    NewProductPriceDto,
  } from './dto/product.dto';
  import { ProductRepository } from './schema/product.repository';
  
  @Injectable()
  export class ProductsNewsService {
    constructor(private productRepository: ProductRepository) {}
  
    async createProduct(productDto: NewProductDto) {
      try {
        const newProduct = await this.productRepository.addProduct(productDto);
        return {
          statusCode: 200,
          message: 'Product stored successfully',
          data: newProduct,
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Error saving Product, try again');
      }
    }
  
    async fetchProducts(data, query) {
      const payload = data ? data : {};
      return this.productRepository.fetchProduct(payload, query);
    }
  
    async getSingleProduct(search) {
      try {
        const data = await this.productRepository.getSingleProduct(search);
        return {
          statusCode: 200,
          message: 'Product fetched',
          data,
        };
      } catch (error) {
        throw new NotFoundException('Product Not found');
      }
    }
  
    async updateProduct(productId, status) {
      try {
        const data = await this.productRepository.updateProduct(
          { _id: productId },
          { availabilityStatus: status },
        );
        return {
          statusCode: 200,
          message: 'Product updated successfully',
          data,
        };
      } catch (error) {
        throw new InternalServerErrorException(
          'Error with updating product, try again',
        );
      }
    }
  
    async createNews(newProductnews: NewProductNewsDto) {
      try {
        const newNews = await this.productRepository.createNews(newProductnews);
        return {
          statusCode: 200,
          message: 'News created Successfully',
          data: newNews,
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Unable to store news');
      }
    }
  
    async getNews(search, query) {
      return await this.productRepository.getNews(search, query);
    }
  
    async getSingleNews(data) {
      try {
        return await this.productRepository.getSingleNews(data);
      } catch (error) {
        throw new NotFoundException('New not found');
      }
    }
  
    async updateNews(news_id, data: any) {
      try {
        const update = await this.productRepository.updateNews(
          { _id: news_id },
          data,
        );
        return {
          statusCode: 200,
          message: 'News updated successfully',
          update,
        };
      } catch (error) {
        throw new InternalServerErrorException(
          'Error with updating news, try again',
        );
      }
    }
  
    async addProductSubscription(data: {
      product: Types.ObjectId;
      userId: Types.ObjectId;
    }) {
      try {
        const productSub = await this.productRepository.addProductSubscription(
          data,
        );
        return {
          statusCode: 200,
          message: 'Product subscription successful',
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Error adding product');
      }
    }
  
    async fetchProductSubscription(search, queryParam) {
      try {
  
        if(queryParam.productId){ 
          search = { ...search, product: queryParam.productId }
  
        }
         
        const products = await this.productRepository.fetchProductSubscription(
          search,
        );
        return {
          statusCode: 200,
          message: 'Product fetch successfully',
          data: products,
        };
      } catch (error) {
        console.log(error);
        throw new NotFoundException('Unable to find product');
      }
    }
  
    async updateProductSubscription(search) {
      try {
        await this.productRepository.updateProductSubscription(search);
        return {
          statusCode: 200,
          message: 'Product subscription removed successfully',
        };
      } catch (error) {
        console.log(error);
        throw new InternalServerErrorException('Internal Error');
      }
    }
  
    /*
    1. Create daily price by cron first thing in the morning based on yesterday price
    2. Update daily price with frontend Admin
    3. Fetch daily price for products or for all product for the day 
     */
  
    async createDailyPrice(newProductPrice: NewProductPriceDto) {
      const existProduct = await this.productRepository.fetchSingleDailyPrice({
        product: newProductPrice.productId,
      });
      if (existProduct) {
        throw new UnprocessableEntityException(
          'Product already added to product Pricing',
        );
      }
      const productData = {
        product: newProductPrice.productId,
        currentPrice: newProductPrice.currentPrice,
      };
      await this.productRepository.createDailyPrice(productData);
      return {
        statusCode: 200,
        message: 'Product Added to Price List',
      };
    }
  
    async cronUpdateDailyPrice() {
      return await this.productRepository.setDailyProductPrice();
    }
  
    async updateDailyPrice(data) {
      let update;
      if (data.currentPrice !== '' && data.currentPrice !== undefined) {
        update = { ...update, currentPrice: data.currentPrice };
      }
      if (data.relatedNews !== '' && data.relatedNews !== undefined) {
        update = { ...update, relatedNews: data.relatedNews };
      }
      try {
        await this.productRepository.updateDailyPrice(
          { _id: data.priceId },
          update,
        );
  
        return {
          statusCode: 200,
          message: 'Product Update successfully',
        };
      } catch (error) {
        throw new UnprocessableEntityException('Product not Updated');
      }
    }
  
    async fetchSingleDailyPrice(product) {
      const today = new Date();
      today.setHours(0, 0, 0);
      const data = {
        product,
        createdAt: { $gte: today },
      };
      const price = await this.productRepository.fetchSingleDailyPrice(data);
  
      if (!price) {
        throw new NotFoundException('Product price not found');
      }
      return {
        statusCode: 200,
        message: 'Product price fetched successfully',
        data: price,
      };
    }
  
    async fetchDailyPrice(search) {
      const today = new Date();
      today.setHours(0, 0, 0);
      const data = { createdAt: { $gte: today } };
      return await this.productRepository.fetchMultipleDailyPrice(data, search);
    }
  
    async getProductPriceGraphData(productId, intervals) {
      const graph = await this.productRepository.getProductGraphData(
        productId,
        intervals,
      );
  
      return {
        statusCode: 200,
        message: 'graph fetched successfully',
        data: graph,
      };
    }
  }
  