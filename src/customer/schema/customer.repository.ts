import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Customer } from './customer.schema';

@Injectable()
export class CustomerRepository {
  constructor(
    @InjectModel(Customer.name) private readonly customerModel: Model<Customer>,
  ) {}

  async createCustomer(data: any): Promise<Customer> {
    return await this.customerModel.create(data);
  }

  async getAll(query: any, businessId: string | null = null) {
    let queryObject: any = {};
    let { search, page, limit } = query;

    if (search) {
      queryObject.name = { $regex: search, $options: 'i' };
    }

    if (businessId) {
      queryObject.businessId = businessId;
    }

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const total_count = await this.customerModel
      .find(queryObject)
      .countDocuments()
      .exec();
    const customers = await this.customerModel
      .find(queryObject)
      .skip(skip)
      .limit(limit)
      .sort('createdAt');

    const numOfPages = Math.ceil(total_count / limit);

    return {
      customers,
      count: total_count,
      numOfPages,
      currentPage: page,
    };
  }

  async getSingleCustomer(data: any): Promise<Customer> {
    return await this.customerModel.findOne(data).exec();
  }

  async updateCustomer(search: any, data: any): Promise<Customer> {
    return await this.customerModel.findOneAndUpdate(search, data, { new: true });
  }

  async deleteCustomer(data: any): Promise<void> {
    const customer = await this.customerModel.findOne(data).exec();
    if (!customer) {
      throw new Error('Customer not found');
    }
    await customer.deleteOne();
  }
}
