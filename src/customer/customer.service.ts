import { Injectable } from '@nestjs/common';
import { CustomerRepository } from './schema/customer.repository';
import { CustomerDTO } from './dto/customerDto';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { Response } from 'express';

@Injectable()
export class CustomerService {
  constructor(
    private customerRepository: CustomerRepository,
    private apiResponse: ApiResponse,
  ) {}

  async createCustomer(decoded: any, body: CustomerDTO, res: Response) {
    try {
      const { sID } = decoded;
      const payload = { ...body, businessId: sID };
      const customer = await this.customerRepository.createCustomer(payload);
      return this.apiResponse.success(
        res,
        'Customer created successfully',
        customer,
        201,
      );
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getCustomers(query: any, decoded: any, res: Response) {
    try {
      const { sID } = decoded;
      const customers = await this.customerRepository.getAll(query, sID);
      return this.apiResponse.success(res, 'Customers retrieved successfully', customers);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getCustomer(id: string, decoded: any, res: Response) {
    try {
      const { sID } = decoded;
      const customer = await this.customerRepository.getSingleCustomer({ _id: id, businessId: sID });
      return this.apiResponse.success(res, 'Customer retrieved successfully', customer);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async updateCustomer(id: string, decoded: any, body: CustomerDTO, res: Response) {
    try {
      const { sID } = decoded;
      const customer = await this.customerRepository.updateCustomer(
        { _id: id, businessId: sID },
        body,
      );
      return this.apiResponse.success(res, 'Customer updated successfully', customer);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async deleteCustomer(id: string, decoded: any, res: Response) {
    try {
      const { sID } = decoded;
      await this.customerRepository.deleteCustomer({ _id: id, businessId: sID });
      return this.apiResponse.success(res, 'Customer deleted successfully', []);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }
}
