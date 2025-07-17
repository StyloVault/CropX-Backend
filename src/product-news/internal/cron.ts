import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { ProductRepository } from '../schema/product.repository';

@Injectable()
export class CronJob {
  constructor(private productRepository: ProductRepository) {}
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT)
  handleNewProductPrice() {
    console.log('Treating new Product price');
    this.productRepository.setDailyProductPrice();
  }
}
