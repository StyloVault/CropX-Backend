import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Types } from 'mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';

export type LoginDocument = Login & Document;

@Schema({ timestamps: true, collection: 'logins' })
export class Login {
  @Prop({ type: Types.ObjectId, required: true, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  deviceName: string;

  @Prop({ type: Object })
  useAgent: object;

  @Prop({ type: String })
  ipAddress: string;
}

export const LoginSchema = SchemaFactory.createForClass(Login);

LoginSchema.plugin(softDeletePlugin);

@Schema({ timestamps: true, collection: 'user_devices' })
export class UserDevice {
  @Prop({ type: String })
  deviceName: string;

  @Prop({ type: String, require: true })
  deviceToken: string;

  @Prop({ type: Boolean, default: false })
  deviceVerified: boolean;

  @Prop({ type: Boolean, default: false })
  blackListDevice: boolean;
}

export const UserDeviceSchema = SchemaFactory.createForClass(UserDevice);
