import { Injectable } from "@nestjs/common";
import { InventoryDTO } from "../../inventory/dto/inventoryDto";
import { InventoryRepository } from "../../inventory/schema/inventory.repository";
import { LowStockEvent } from "../events/lowStockEvent";
import { OutOfStockEvent } from "../events/OutOfStockEvent copy";
import { Inventory } from "../../inventory/schema/inventorySchema";
import { TransactionType } from "../enum/transactionEnum";
import { TransactionDTO } from "../dto/transactionDto";
import { TransactionRepository } from "../schema/transaction.repository";
import { Transaction } from "../schema/transactionSchema";


@Injectable()
export class CreateTransactionAction {
   
    private data : any
    private transaction : Transaction | null
    private products : any = [] 
    private totalQuantity : number = 0;
    private totalAmount : number = 0;
    
    constructor(
        private readonly inventoryRepository : InventoryRepository,
        private readonly transactionRepository : TransactionRepository,
        private readonly lowStockCheck : LowStockEvent,
        private readonly outOfStockCheck : OutOfStockEvent) {
        }


    public async execute(sID:string, body : TransactionDTO) {
             this.processTransactionVariables(sID, body); 
             await this.createTransaction();
             await this.processProductUnitTransaction(sID, body); 
             await this.updateInventoriesAndSendEvents();
             return {transaction :this.transaction, units : this.products};
    }
      
    private async createTransaction() {
        this.transaction = await this.transactionRepository.createTransaction(this.data);
        return this;
    }

    private checkLowStock(inventory: Inventory) {
          this.lowStockCheck.execute(inventory)
          return this;
    }

    private async updateInventoriesAndSendEvents() {
        const unitIds = await Promise.all(
            this.products.map(async (product) => {
                let dbProduct = await this.transactionRepository.getProductUnit({_id: product._id});

                return dbProduct._id
            })
        );
        // let units = this.products.map(product =>  product._id);
        this.transaction = await this.transactionRepository.updateTransaction({_id: this.transaction?._id}, {totalQuantity : this.totalQuantity, unitIds, totalAmount : this.totalAmount})
        this.products.forEach(async (product) => {
             const inventory = await this.inventoryRepository.getSingleInventory(product.productId)
            this.checkLowStock(inventory).checkOutOfStock(inventory) 
        });
       
    }


    private checkOutOfStock(inventory){ 
        this.outOfStockCheck.execute(inventory)
        return this;

    }
   
    private processTransactionVariables(sID:string, body : TransactionDTO)   {
     
  
        this.data = {
             externalReference : body.externalReference,
              transactionReference : this.generateTransactionReference(),
              description : body.description,
              businessId : sID,
              type : body.type,
              subtype : body.subtype
        }
    }
     private async processProductUnitTransaction(sID, body : TransactionDTO)   {
        this.products =[]
       for (const product of body.products) {     
                    const inventory = await this.inventoryRepository.getSingleInventory({_id : product.productId, businessId : sID})
                     
                    const productUnit =  {
                        transactionId : this.transaction?._id,
                        quantity: product.quantity,
                        productId : inventory._id,
                        previousQuantityAvailable : inventory.quantityAvailable,
                        totalAmount : inventory.sellingPrice * product.quantity,
                        presentQuantityAvailable : this.getPresentQuantity(body.type, product.quantity, inventory),
                     }
                     this.products.push(productUnit);
                     this.totalQuantity += product.quantity;
                     this.totalAmount += productUnit.totalAmount
                     await this.inventoryRepository.updateInventory({_id : product.productId} , {quantityAvailable : productUnit.presentQuantityAvailable})
            }

          this.products =  await this.transactionRepository.createProductUnit(this.products);
          
        
        }
   
      private generateTransactionReference(): string {
          const randomPart = String(Math.floor(100000 + Math.random() * 900000));
          const currentTimestamp = Math.floor(new Date().getTime() / 1000);
          const transactionReference = `STY|${currentTimestamp}${randomPart}`; 
         return transactionReference;
      }
  
      private getPresentQuantity(type : TransactionType, quantity : number, inventory: Inventory ) {

        if (type === TransactionType.EXPENSE && inventory.quantityAvailable < quantity) {
            throw new Error('Insufficient quantity available for expense transaction.');
        }

         return (type == TransactionType.INCOME)
                    ? quantity + inventory.quantityAvailable 
                    :  inventory.quantityAvailable - quantity; 
        }
  
  }