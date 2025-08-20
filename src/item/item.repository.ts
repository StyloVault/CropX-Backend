import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Item } from './item.schema';

@Injectable()
export class ItemRepository {
  constructor(@InjectModel('Item') private readonly itemModel: Model<Item>) {}

  async createItem(data: any): Promise<Item> {
    try {
      return await this.itemModel.create(data);
    } catch (e) {
      throw new Error('Item could not be created');
    }
  }

  async upsertItem(filter: any, data: any): Promise<Item> {
    return this.itemModel.findOneAndUpdate(filter, data, { new: true, upsert: true });
  }

  async getItemById(id: string): Promise<Item> {
    const item = await this.itemModel.findById(id);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async updateItem(filter: any, data: any): Promise<Item> {
    const item = await this.itemModel.findOneAndUpdate(filter, data, {
      new: true,
      runValidators: true,
    });
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async getAll(query: any, businessId: string | null = null) {
    let queryObject: any = {};
    let { search, page, limit, sort, fields, numericFilters } = query;

    if (search) {
      queryObject.name = { $regex: search, $options: 'i' };
    }

    if (businessId) {
      queryObject.businessId = businessId;
    }

    if (numericFilters) {
      const operatorMap = {
        '>': '$gt',
        '>=': '$gte',
        '=': '$eq',
        '<': '$lt',
        '<=': '$lte',
      } as any;

      const regEx = /\b(<|>|>=|=|<|<=)\b/g;
      let filters = numericFilters.replace(regEx, (match) => `-${operatorMap[match]}-`);
      const options = ['price'];
      filters.split(',').forEach((item) => {
        const [field, operator, value] = item.split('-');
        if (options.includes(field)) {
          queryObject[field] = { [operator]: Number(value) };
        }
      });
    }

    let result: any = this.itemModel.find(queryObject);

    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList);
    } else {
      result = result.sort('createdAt');
    }

    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }

    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;

    const totalCount = await this.itemModel.find(queryObject).countDocuments().exec();
    result = result.skip(skip).limit(limit);
    const items = await result.exec();
    const numOfPages = Math.ceil(totalCount / limit);

    return {
      items,
      count: totalCount,
      numOfPages,
      currentPage: page,
    };
  }
}
