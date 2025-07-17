import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';

export type PasswordDocument = Password & Document;

@Schema({ timestamps: true, collection: 'passwords' })
export class Password {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  password: string;
}

export const PassowrdSchema = SchemaFactory.createForClass(Password);
