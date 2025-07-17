import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { BankName, CardDeliveryStatus } from '../interface/card.enum';

@Schema({timestamps: true, collection:'cards'})
export class Card {
    @Prop({ type: Types.ObjectId, require: true, unique: true})
    user: Types.ObjectId;

    @Prop({ type: Object })
    address: Object;

    @Prop({
        type: Number,
        get: (v) => (v / 100).toFixed(2),
        set: (v) => v * 100,
        default: 0,
        required: true,
      })
    accountBalance: number;

    @Prop({type: Boolean, required: true, default: false})
    suspend: boolean;

    @Prop({type: String, unique: true, sparse: true})
    customerCardId: string;

    @Prop({type: String, unique: true, sparse: true,})
    cardID: string;

    @Prop({type: String})
    cardNumber: string;


    @Prop({type: Object})
    userData: object;

    @Prop({type: Object})
    metadata: object;
    
}

export const CardSchema = SchemaFactory.createForClass(Card);

CardSchema.set('toObject', { getters: true });
CardSchema.set('toJSON', { getters: true });

@Schema({timestamps: true, collection: 'card_request'})
export class CardRequest {
  @Prop({type: Types.ObjectId, ref: 'Card'})
  card: Types.ObjectId;
  
  @Prop({type: Types.ObjectId })
  user: Types.ObjectId;

  @Prop({type: Object, required: true})
  address: Object;

  @Prop({type: Object})
  userData: any;

  @Prop({type: String, required: true, default: CardDeliveryStatus.PENDING})
  cardDeliveryStatus: CardDeliveryStatus;

  @Prop({type: Object})
  metadata: any;

}

export const CardRequestSchema =  SchemaFactory.createForClass(CardRequest);


@Schema({timestamps: true, collection: 'account_details'})
export class AccountDetails {

  @Prop({type: Types.ObjectId, ref: 'Card'})
  card: Types.ObjectId;

  @Prop({type: String, unique: true})
  accountNumber: string;

  @Prop({type: String})
  accountName: string;

  @Prop({type: String, enum: BankName})
  bankName: BankName;

  @Prop({type: Object})
  metadata: Object
}

export const AccountDetailsSchema = SchemaFactory.createForClass(AccountDetails);