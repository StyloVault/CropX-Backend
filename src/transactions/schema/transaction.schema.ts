import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { TransactionStatus, TransactionType } from "../dto/transaction.enum";

@Schema({timestamps: true, collection:'transactions'})
export class Transaction {
    @Prop({type: Types.ObjectId, ref: 'User', required: true})
    user: Types.ObjectId;

    @Prop({type: Types.ObjectId, ref: 'Card'})
    card: Types.ObjectId;

    @Prop({type: Object})
    bankInfo: object;

    @Prop({
      type: Number,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
      default: 0,
      required: true,
    })
   amount : number;

    @Prop({
        type: Number,
        get: (v) => (v / 100).toFixed(2),
        set: (v) => v * 100,
        default: 0,
        required: true,
      })
    previousBalance: number;

    @Prop({
      type: Number,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
      default: 0,
      required: true,
    })
    newBalance : number;

    @Prop({
      type: Number,
      get: (v) => (v / 100).toFixed(2),
      set: (v) => v * 100,
      default: 0,
      required: true,
    })
    charges: number;


    @Prop({type: String, enum: TransactionType})
    transactionType: TransactionType;

    @Prop({type: String, enum: TransactionStatus, default: TransactionStatus.PENDING})
    transactionStatus: TransactionStatus;

    @Prop({type: Object})
    externalInformation: object;

    @Prop({type: Object})
    metadata: object;
}

export const TransactionSchema = SchemaFactory.createForClass(Transaction);

TransactionSchema.set('toObject', { getters: true });
TransactionSchema.set('toJSON', { getters: true });