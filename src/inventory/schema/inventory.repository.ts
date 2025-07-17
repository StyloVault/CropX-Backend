import { BadRequestException, Injectable, InternalServerErrorException } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { Inventory } from "./inventorySchema";
import { InventoryDTO } from "../dto/inventoryDto";
import { InventoryStatus } from "../enum/inventoryEnum";

@Injectable()
export class InventoryRepository {

    constructor(
      @InjectModel('Inventory') private readonly inventoryModel: Model<Inventory>,
    ){}

     public async createInventory(data : any) : Promise<Inventory> {
        try {
            return await this.inventoryModel.create(data);
        } catch (error) {
            throw new Error('Inventory could not be created');
        }
       }
    
       public async getAll(query, sID: string |null = null) {
  
        let queryObject: any = {};
        let {status, search, page, limit, sort, fields, numericFilters } = query;
    
        if (status && !Object.values(InventoryStatus).includes(status))  {
            throw new BadRequestException('Query Parameter Not Found');
        } 
    
        if (status) {
          queryObject.status = status;
        }
        if(search) {
          queryObject.name =  { $regex: search, $options: 'i' };
        }      
     
        if(sID) {
            queryObject.businessId = sID;
        }


        if (numericFilters) {
          const operatorMap = {
            '>': '$gt',
            '>=': '$gte',
            '=': '$eq',
            '<': '$lt',
            '<=': '$lte',
          };
      
          const regEx = /\b(<|>|>=|=|<|<=)\b/g;
          let filters = numericFilters.replace(
            regEx,
            (match) => `-${operatorMap[match]}-`
          );
          const options = ['lowStockValue', 'quantityAvailable', 'costPrice', 'sellingPrice'];
          filters = filters.split(',').forEach((item) => {
            const [field, operator, value] = item.split('-');
            if (options.includes(field)) {
              queryObject[field] = { [operator]: Number(value) };
            }
          });
      
        }
        let result :any = this.inventoryModel.find(queryObject);
      
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
      
        let total_count = await this.inventoryModel.find(queryObject).countDocuments().exec()
        result = result.skip(skip).limit(limit);
      
        const response = await result.exec(); 
        const numOfPages = Math.ceil(total_count / limit);
    
        return {
          inventories: response,
          count: total_count,
          numOfPages,
          currentPage : page
        };
      }
      
    
    async getSingleInventory(data : any) {
        const inventory = await this.inventoryModel.findOne(data).exec();
       console.log(inventory)
        if(!inventory) {
            throw new Error('inventory not found');
        }
        return inventory;
    }
    
    async updateInventory(search : any, data : any) {
        return await this.inventoryModel.findOneAndUpdate(search, data, {
            new: true,
        });
    }
    
    public async deleteSingleInventory(data: any) : Promise<void> {
        
        const inventory =  await this.inventoryModel.findOne(data).exec()

        if(!inventory) {
            throw new Error('Inventory not found');
        }

        await inventory.deleteOne();
    }
  

    


}


