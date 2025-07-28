import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types, Document } from 'mongoose';

@Schema({ timestamps: true, collection: 'customers' })
export class Customer {
  _id: Types.ObjectId;
  @Prop({ type: Types.ObjectId, ref: 'Business' })
  businessId: Types.ObjectId;

  @Prop({ type: String, required: true })
  name: string;

  @Prop({ type: String, required: true })
  email: string;

  @Prop({ type: String, required: true })
  phone: string;

  @Prop({ type: String })
  billingAddress: string;

  @Prop({ type: String })
  deliveryAddress: string;
}

export const CustomerSchema = SchemaFactory.createForClass(Customer);

export type CustomerDocument = Customer & Document;
