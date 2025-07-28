import { Injectable } from '@nestjs/common';
import { ItemRepository } from './item.repository';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { InventoryRepository } from 'src/inventory/schema/inventory.repository';
import { Response } from 'express';

@Injectable()
export class ItemService {
  constructor(
    private itemRepository: ItemRepository,
    private apiResponse: ApiResponse,
    private inventoryRepository: InventoryRepository,
  ) {}

  async getItems(query: any, decoded: any, res: Response) {
    try {
      const { sID } = decoded;
      const items = await this.itemRepository.getAll(query, sID);
      return this.apiResponse.success(res, 'Items retrieved successfully', items);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getItemsAdmin(query: any, res: Response) {
    try {
      const items = await this.itemRepository.getAll(query);
      return this.apiResponse.success(res, 'Items retrieved successfully', items);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getUserItemsAdmin(query: any, sId: string, res: Response) {
    try {
      const items = await this.itemRepository.getAll(query, sId);
      return this.apiResponse.success(res, 'Items retrieved successfully', items);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getItem(id: string, decoded: any, res: Response) {
    try {
      const { sID } = decoded;
      const item = await this.itemRepository.getItemById(id);
      if (item.businessId.toString() !== sID) {
        return this.apiResponse.failure(res, 'Item not found', [], 404);
      }
      return this.apiResponse.success(res, 'Item retrieved successfully', item);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async getItemAdmin(id: string, res: Response) {
    try {
      const item = await this.itemRepository.getItemById(id);
      return this.apiResponse.success(res, 'Item retrieved successfully', item);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }

  async updateItemPrice(id: string, decoded: any, data: any, res: Response) {
    try {
      const { sID } = decoded;
      const item = await this.itemRepository.updateItem(
        { _id: id, businessId: sID },
        { price: Number(data.price) },
      );
      if (item.inventoryId) {
        await this.inventoryRepository.updateInventory(
          { _id: item.inventoryId },
          { sellingPrice: item.price },
        );
      }
      return this.apiResponse.success(res, 'Item updated successfully', item);
    } catch (error) {
      return this.apiResponse.failure(res, error.message, [], error.statusCode);
    }
  }
}
