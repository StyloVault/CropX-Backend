import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import Bugsnag from '@bugsnag/js'
import { Transaction } from "./transaction.schema";

@Injectable()
export class TransactionRepository {

    constructor(
        @InjectModel(Transaction.name) private readonly transactionModel: Model<Transaction>,
    ){}


    async createTransaction(data) {
        return await new this.transactionModel(data).save();
      }
    
      async fetchTransactions(data, query) {
        try {
          const subUser = this.transactionModel
            .find(data)
            .populate('user')
            .populate('card');
          let { page, limit } = query;
          page = Number(page) || 1;
          limit = Number(limit) || 10;
          const skip = (page - 1) * limit;
    
          const userData: any[] = [];
          const output = await subUser.skip(skip).limit(limit).sort('-createdAt');
    
          for (const item of output) {
            userData.push(item);
          }
          const totalNum = await this.transactionModel.where(data).count();
    
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
    
      async getSingleTransaction(data) {
        return await this.transactionModel
          .findOne(data)
          .populate('user')
          .populate('card')
          .exec();
      }
    
      async updateTransaction(search, data) {
        return await this.transactionModel.findOneAndUpdate(search, data, {
          new: true,
        });
      }
}