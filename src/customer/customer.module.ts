import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';
import { Customer, CustomerSchema } from './schema/customer.schema';
import { CustomerRepository } from './schema/customer.repository';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Customer.name, schema: CustomerSchema }]),
  ],
  controllers: [CustomerController],
  providers: [CustomerService, CustomerRepository, ApiResponse],
  exports: [CustomerRepository],
})
export class CustomerModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CustomerController);
  }
}
