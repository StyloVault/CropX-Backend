import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document, Types } from "mongoose";
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import { InventoryStatus } from "../enum/inventoryEnum";

export type InventoryDocument = Inventory & Document;


@Schema({timestamps: true, collection:'inventory'})
export class Inventory {
    _id: Types.ObjectId;
    
    @Prop({ type: String })
    id : string

    @Prop({ type: String })
    productId : string
 
    @Prop({ type: String })
    description : string

     @Prop({type : String, required: true})
     businessId : string

     @Prop({ type: String })
     productImage: string;

     @Prop({ type: String })
     unitOfMeasure : string

    @Prop({
        type : String,
        default : InventoryStatus.ACTIVE
    })
    status: InventoryStatus

    @Prop({
        type: String,
        required: true,
      })
      name: string;

      @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    lowStockValue : number

     @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    costPrice : number

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    sellingPrice : number
    

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    quantityAvailable : number

}

export const InventorySchema = SchemaFactory.createForClass(Inventory);

InventorySchema.plugin(softDeletePlugin);
InventorySchema.set('toObject', { getters: true });
InventorySchema.set('toJSON', { getters: true });
InventorySchema.index({ businessId: 1, productId: 1 }, { unique: true });
