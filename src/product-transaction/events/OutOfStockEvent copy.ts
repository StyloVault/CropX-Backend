import { Injectable } from "@nestjs/common";

@Injectable()
export class OutOfStockEvent {


    public async execute(inventory)  : Promise<any> {
        
    }
}