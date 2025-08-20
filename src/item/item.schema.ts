import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';

@Schema({ timestamps: true, collection: 'items' })
export class Item {
  _id: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business', required: true })
  businessId: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Inventory' })
  inventoryId?: Types.ObjectId;

  @Prop({ type: String })
  name: string;

  @Prop({ type: String })
  description: string;

  @Prop({ type: String })
  unitOfMeasure: string;

  @Prop({ type: Number, default: 0 })
  price: number;
}

export const ItemSchema = SchemaFactory.createForClass(Item);
