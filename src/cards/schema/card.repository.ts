import { Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { AccountDetails, Card, CardRequest } from "./card.schema";
import Bugsnag from '@bugsnag/js'
import { AccountDetailsInterface, CardInterface, CardRequestInterface } from "../interface/card.interface";
import { BankName } from "../interface/card.enum";

@Injectable()
export class CardRepository {

    constructor(
        @InjectModel(Card.name) private readonly cardModel: Model<CardInterface>,
        @InjectModel(CardRequest.name) private readonly cardRequestModel: Model<CardRequestInterface>,
        @InjectModel(AccountDetails.name) private accountDetailsModel: Model<AccountDetailsInterface>,
    ){}


    async addCard(data) {
        return await new this.cardModel(data).save();
      }
    
    async fetchCards(data: Record<string, any>, query: Record<string, any>) {
  try {
    const subUser = this.cardModel.find(data).populate('user');
    let { page, limit } = query;
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const userData: any[]= [];
    const output = await subUser.skip(skip).limit(limit).sort('-createdAt');

    for (const item of output) {
      const account = await this.getSingleAccountDetail({ card: item._id });

      // If you're using Mongoose, convert to plain JS object if needed
      const plainItem = item.toObject ? item.toObject() : item;

      userData.push({
        ...plainItem,
        account,
      });
    }

    const totalNum = await this.cardModel.where(data).countDocuments();
    const numOfPages = Math.ceil(totalNum / limit);

    return {
      statusCode: 200,
      message: 'Requested cards fetched successfully',
      data: userData,
      totalNum,
      numOfPages,
    };
  } catch (error) {
    console.error('fetchCards error:', error);
    Bugsnag.notify(error);
    throw new InternalServerErrorException('Unable to process transaction');
  }
}

    
    async getSingleCard(data) {
      return await this.cardModel.findOne(data).populate('user').exec();
    }
  
    async updateCard(search, data) {
      return await this.cardModel.findOneAndUpdate(search, data, {
        new: true,
      });
    }

    async createCardRequest(data) {
        return await new this.cardRequestModel(data).save();
    }

    async getSingleCardRequest(data) {
      return await this.cardRequestModel
        .findOne(data)
        .populate('card')
        .populate('user')
        .exec();
    }

    async updateCardRequest(search, data) {
      return await this.cardRequestModel
        .findOneAndUpdate(search, data, { new: true })
        .populate('card')
        .populate('user')
        .exec();
    }

    async fetchCardRequests(data, query) {
      try {
        const subUser = this.cardRequestModel
          .find(data)
          .populate('card')
          .populate('user');
        let { page, limit } = query;
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const skip = (page - 1) * limit;
  
        const userData: any[] = [];
        const output = await subUser.skip(skip).limit(limit).sort('-createdAt');
  
        for (const item of output) {
          userData.push(item);
        }
        const totalNum = await this.cardRequestModel.where(data).count();
  
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

    async createAccountDetail(data) {
      console.log(data);
      return await new this.accountDetailsModel(data).save();
    }

    async getAccountDetails(data, query) {
      try {
        const subUser = this.accountDetailsModel.find(data).populate('card');
        let { page, limit } = query;
        page = Number(page) || 1;
        limit = Number(limit) || 10;
        const skip = (page - 1) * limit;
  
        const userData: any[] = [];
        const output = await subUser.skip(skip).limit(limit).sort('-createdAt');
  
        for (const item of output) {
          userData.push(item);
        }
        const totalNum = await this.accountDetailsModel.where(data).count();
  
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
      };
    }

    async getSingleAccountDetail(data){
      return await this.accountDetailsModel.findOne(data).populate('card').exec();
    }
}