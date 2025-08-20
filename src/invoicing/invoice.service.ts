import { Injectable, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { InvoiceRepository } from './schema/invoiceRepository';
import { InvoiceDTO } from './dto/invoiceDto';
import { InvoiceStatus } from './enum/invoiceEnum';
import { NotFoundError } from 'rxjs';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { Response, response } from 'express';
import { TransferWebhookAction } from 'src/Actions/transferWebhook';
import { Utils } from 'src/common/Helper/Utils';
import { ItemRepository } from 'src/item/item.repository';
import { InventoryRepository } from 'src/inventory/schema/inventory.repository';

@Injectable()
export class InvoiceService {
 
    constructor(private invoiceRepository : InvoiceRepository,
                       private apiResponse : ApiResponse ,
                       private readonly utils : Utils,
                       private transferWebhookAction : TransferWebhookAction,
                       private itemRepository: ItemRepository,
                       private inventoryRepository: InventoryRepository){}

    async createInvoice(sID: string, body : InvoiceDTO, res: Response) {
        try {
         for (const item of body.items) {
             item.price = Number(item.price);
             item.quantity = Number(item.quantity);
             if (item.id) {
                 try { await this.itemRepository.getItemById(item.id); } catch {
                     const newItem = await this.itemRepository.createItem({
                         name: item.name,
                         description: item.description,
                         unitOfMeasure: item.unitOfMeasure,
                         price: item.price,
                         businessId: sID,
                     });
                     item.id = newItem._id.toString();
                 }
             } else {
                 const newItem = await this.itemRepository.createItem({
                     name: item.name,
                     description: item.description,
                     unitOfMeasure: item.unitOfMeasure,
                     price: item.price,
                     businessId: sID,
                 });
                 item.id = newItem._id.toString();
             }
         }
         const invoice = await this.invoiceRepository.createInvoice(sID, body);
         return this.apiResponse.success(res, 'Invoice created successfully', invoice, 201)
        }catch (error) {
           return this.apiResponse.failure(res, error.message, error, error.statusCode);
        }

    }
   async getOneInvoice(id : string, res: Response) {
    try {
        return this.apiResponse.success(res, 'Invoice retrieved successfully', await this.invoiceRepository.getOne(id))
    }catch(error) {
       return this.apiResponse.failure(res, error.message, error, error.statusCode)
    }
   }

   async deleteInvoice(id : string, sID: string, res: Response) {
    try {
        await this.invoiceRepository.deleteOne({_id:id, 'business.id' : sID})
        return this.apiResponse.success(res, 'Invoice deleted successfully', [])
    }catch(error) {

        return this.apiResponse.failure(res, error.message, error, error.statusCode)
    }
   }

    async getAllInvoices(body : any, sId: string, res: Response) {
    
        try {
            const invoices =  await this.invoiceRepository.getAll(body, sId); 
                
           return this.apiResponse.success(res, 'Invoices retreived successfully', invoices)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, error, error.statusCode)   
        }   
      }

    async transferWebhook(data, res: Response) {
     try {
       await this.transferWebhookAction.execute(data).then(() => {
            return this.apiResponse.success(res, 'Payment made successfully', response)
       })
       
     } catch (error) {
        const message = error.message ??  'Something went wrong';
        return this.apiResponse.failure(res, message, [], 400)
     }
  
    }

  async invoicePayment(invoiceId : string , res: Response) {
        try {
           
         const invoice =  await this.invoiceRepository.getOne(invoiceId)
         const now = new Date();

        if(invoice.status == InvoiceStatus.OVERDUE) {
            return this.apiResponse.failure(res, 'Error paying for Overdue Invoice', [], 400)
        }
   
        if(invoice.accountNumberExpirationDate > now) { 
            return this.apiResponse.success(res, 'Invoice retreived successfully', await this.utils.getInvoiceAcct(invoice.virtualAccountId) )
        }
        const account =  await this.utils.createInvoiceAcct(invoice);

        await this.invoiceRepository.updateInvoice({_id : invoiceId}, {
            virtualAccountId : account._id,
            accountNumber : account.accountNumber,
            accountNumberExpirationDate : new Date(now.getTime() + account.validFor * 1000)
        });
        return this.apiResponse.success(res, 'Invoice retreived successfully', account)
    }catch (error) {
        return this.apiResponse.failure(res, error.message, [], 400)
    }
    }

    private async reduceInventory(items: any[]) {
        for (const item of items) {
            if (!item.id) continue;
            try {
                const invItem = await this.itemRepository.getItemById(item.id);
                if (invItem?.inventoryId) {
                    await this.inventoryRepository.updateInventory(
                        { _id: invItem.inventoryId },
                        { $inc: { quantityAvailable: -item.quantity } },
                    );
                }
            } catch (e) {
                // ignore errors
            }
        }
    }

    async manualPayment(invoiceId: string, res: Response) {
        try {
            const invoice = await this.invoiceRepository.getOne(invoiceId);
            if (invoice.status === InvoiceStatus.SETTLED) {
                return this.apiResponse.success(res, 'Invoice already settled', invoice);
            }
            await this.invoiceRepository.updateInvoice({ _id: invoiceId }, { status: InvoiceStatus.SETTLED });
            await this.reduceInventory(invoice.items);
            return this.apiResponse.success(res, 'Invoice marked as paid', []);
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], 400);
        }
    }

      //Admin Endpoints 
      async getInvoices(body : any, res: Response) {
        try {
           const invoices = await this.invoiceRepository.getAll(body); 
               
          return this.apiResponse.success(res, 'Invoices retreived successfully', invoices)
       } catch (error) {
           return this.apiResponse.failure(res, error.message, error, error.statusCode)   
       }  
      }
  
      async getAllUserinvoices(body : any, sId: string, res: Response) {
        try {
           const invoices = await this.invoiceRepository.getAll(body, sId); 
               
          return this.apiResponse.success(res, 'invoices retreived successfully', invoices)
       } catch (error) {
           return this.apiResponse.failure(res, error.message, error, error.statusCode)   
       }  
      }
  
  
      async getinvoice(id : string, res: Response) {
        try {
           return this.apiResponse.success(res, 'invoice retreived successfully', await this.invoiceRepository.getSingleInvoice({_id:id}))
        }catch(error) {
          return this.apiResponse.failure(res, error.message, error, error.statusCode)
         }
      }
  
      async updateinvoice() {
  
      }
  
      async deleteSingleInvoice(id : string, sID: string, res: Response) {
        try {
           await this.invoiceRepository.deleteOne({_id:id, 'business.id' : sID})
           return this.apiResponse.success(res, 'invoice  deleted successfully', [])
        }catch(error) {
          return this.apiResponse.failure(res, error.message, error, error.statusCode)
       }
     }
    
}
