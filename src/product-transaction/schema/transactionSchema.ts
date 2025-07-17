import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { TransactionStatus, TransactionType , TransactionSubType} from "../enum/transactionEnum";

@Schema({timestamps: true, collection:'product_units'})
export class ProductUnit {

    @Prop({type: Types.ObjectId, ref: 'Inventory'})
    productId: Types.ObjectId;
 
   @Prop({type: Types.ObjectId, ref: 'Transaction'})
    transactionId: Types.ObjectId;
     
   @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    totalAmount : number
    

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    previousQuantityAvailable : number

    @Prop({
      type: Number,
      default: 0,
      required: true,
      })
    presentQuantityAvailable : number


    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    quantity : number

}


export const ProductUnitSchema = SchemaFactory.createForClass(ProductUnit);


ProductUnitSchema.set('toObject', { getters: true });
ProductUnitSchema.set('toJSON', { getters: true });
 


@Schema({timestamps: true, collection:'transactions'})
export class Transaction {
    _id: string;

    @Prop({ type: String })
    transactionReference : string

    @Prop({ type: String })
    externalReference : string

    @Prop({ type: String })
    description : string

     @Prop({type : String})
     businessId : string

    @Prop({
        type : String,
        default : TransactionStatus.INACTIVE
    })
    status: TransactionStatus

    @Prop({
        type : String,
        default : TransactionType.INCOME
    })
    type : TransactionType

    @Prop({
        type : String,
        default : TransactionSubType.STOCK
    })
    subtype : TransactionSubType

     @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    totalAmount : number
    

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    totalQuantity : number

    @Prop({ type: [{ type: Types.ObjectId, ref: ProductUnit.name }] })
    unitIds: ProductUnit[];
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);


TransactionSchema.set('toObject', { getters: true });
TransactionSchema.set('toJSON', { getters: true });