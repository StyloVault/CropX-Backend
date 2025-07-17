import { Injectable } from '@nestjs/common';
import { InventoryRepository } from './schema/inventory.repository';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { InventoryDTO } from './dto/inventoryDto';
import { Response } from 'express';
import { ActivityRepository } from 'src/common/activity/activity.repository';
import { Types } from 'mongoose';

@Injectable()
export class InventoryService {

    constructor(private inventoryRepository : InventoryRepository, 
      private activityRepository : ActivityRepository, 
        private apiResponse : ApiResponse ,

  ){}

    async createInventory(decoded: any, body : InventoryDTO, res: Response) {
        try {
           const {sID, userId} = decoded
            const payload = this.preparePayload(sID, body);
            const inventory = await this.inventoryRepository.createInventory(payload);
            this.createActivity(inventory, userId, sID, "Created Inventory")
            return this.apiResponse.success(res, 'Inventory created successfully', inventory, 201)
        }catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode);
       }

    }

    async updateInventory(decoded: any,id:string , body : InventoryDTO, res: Response) {
      try {
         const {sID, userId} = decoded
         const payload = this.preparePayload(sID, body);
          const inventory = await this.inventoryRepository.updateInventory({_id : id, businessId: sID},payload);
          this.updateActivity(inventory, userId, sID, 'Updated Inventory')
          return this.apiResponse.success(res, 'Inventory created successfully', inventory, 201)
      }catch (error) {
          return this.apiResponse.failure(res, error.message, [], error.statusCode);
     }
    }

    async createActivity(inventory, userId, sID, description) {
      await this.activityRepository.createActivity({
         businessId : sID,
         description : description,
         createdById : userId,
         payload : inventory 
      })
    }

    async updateActivity(inventory, userId, sID, description) {
      await this.activityRepository.createActivity({
         businessId : sID,
         description : description,
         updatedById : userId,
         payload : inventory 
      })
    }
    preparePayload(sID: string, body: InventoryDTO) {
      console.log(sID)
           return {
                 name: body.name,
                 description : body.description,
                 unitOfMeasure : body.unitOfMeasure,
                 productId : body.productId,
                 costPrice : body.costPrice,
                 sellingPrice : body.sellingPrice,
                 productImage : body.productImage,
                 status : body.status,
                 lowStockValue: body.lowStockValue ?? 0,
                 quantityAvailable : body.quantityAvailable ?? 0,
                 businessId : sID
           } 

    }
  
  
    async getOneInventory(id : string,  sID: string,res: Response){
       try {
          return this.apiResponse.success(res, 'Inventory retreived successfully', await this.inventoryRepository.getSingleInventory({_id : id, businessId: sID}))
       }catch(error) {
         return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }
   
    async getAllInventories(body : any, sId: string, res: Response) {
    
      try {
          const inventories = await this.inventoryRepository.getAll(body, sId); 
              
         return this.apiResponse.success(res, 'Inventories retreived successfully', inventories)
      } catch (error) {
          return this.apiResponse.failure(res, error.message, [], error.statusCode)   
      }   
    }
   async deleteOneInventory(id : string, sID: string, res: Response) {
      try {
         await this.inventoryRepository.deleteSingleInventory({id, businessID : sID})
         return this.apiResponse.success(res, 'Inventory deleted successfully', [])
      }catch(error) {
        return this.apiResponse.failure(res, error.message, [], error.statusCode)
     }
   }


       //Admin Endpoints 

       async getInventories(body : any, res: Response) {
         try {
            const inventoriess = await this.inventoryRepository.getAll(body); 
                
           return this.apiResponse.success(res, 'Inventories retreived successfully', inventoriess)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)   
        }  
       }
   
       async getAllUserInventories(body : any, sId: string, res: Response) {
         try {
            const inventories = await this.inventoryRepository.getAll(body, sId); 
                
           return this.apiResponse.success(res, 'Inventories retreived successfully', inventories)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)   
        }  
       }
   
   
       async getInventory(id : string, res: Response) {
         try {
            return this.apiResponse.success(res, 'Inventory retreived successfully', await this.inventoryRepository.getSingleInventory({_id:id}))
         }catch(error) {
           return this.apiResponse.failure(res, error.message, error, error.statusCode)
          }
       }
   
   
       async deleteInventory(id : string, sID: string, res: Response) {
         try {
            await this.inventoryRepository.deleteSingleInventory({_id:id, businessID : sID})
            return this.apiResponse.success(res, 'inventory  deleted successfully', [])
         }catch(error) {
           return this.apiResponse.failure(res, error.message, error, error.statusCode)
        }
      }
}
