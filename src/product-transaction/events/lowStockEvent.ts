import { Injectable } from "@nestjs/common";
import { Inventory } from "src/inventory/schema/inventorySchema";

@Injectable()
export class LowStockEvent {


    public async execute (inventory : Inventory) : Promise<any> {
       
    }
}