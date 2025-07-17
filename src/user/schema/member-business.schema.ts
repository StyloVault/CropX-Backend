import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import {
  AddressInterface,
  IdentityInterface,
  DocumentsInterface,
  NotificationInterface,
} from '../interface/member-business.interface';
import { UserStatus } from '../interface/user.enum';

@Schema({ timestamps: true, collection: 'membership' })
export class Membership {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: Types.ObjectId, ref: 'Business' })
  business: Types.ObjectId;

  @Prop({ type: String, enum: UserStatus, default: UserStatus.INACTIVE })
  status: UserStatus;

  @Prop({ type: Boolean, required: true, default: false })
  isPrimary: boolean;
}

export const MembershipSchema = SchemaFactory.createForClass(Membership);

@Schema({ timestamps: true, collection: 'addresses' })
export class Address {
  @Prop({ type: String })
  street: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  state: string;
  @Prop({ type: String })
  country: string;
}
export const AddressSchema = SchemaFactory.createForClass(Address);

@Schema({ timestamps: true, collection: 'identities' })
export class Identity {
  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  type: string;

  @Prop({ type: String })
  number: string;
  @Prop({ type: String })
  documentUrl: string;
}

export const IdentitySchema = SchemaFactory.createForClass(Identity);

@Schema({ timestamps: true, collection: 'documents' })
export class Documents {
  @Prop({ type: String })
  certificateUrl: string;

  @Prop({ type: String })
  utilityBillUrl: string;
}

export const DocumentsSchema = SchemaFactory.createForClass(Documents);

@Schema({ timestamps: true, collection: 'notifications' })
export class Notification {
  @Prop({ type: String })
  street: string;

  @Prop({ type: String })
  city: string;

  @Prop({ type: String })
  state: string;
  @Prop({ type: String })
  country: string;
}

export const NotificationSchema = SchemaFactory.createForClass(Notification);

@Schema({ timestamps: true, collection: 'businesses' })
export class Business {
  @Prop({ type: String })
  type: string;
  @Prop({ type: String })
  name: string;
  @Prop({ type: String })
  registrationNumber: string;
  @Prop({ type: String })
  registrationDate: string;
  @Prop({ type: String })
  category: string;
  @Prop({ type: String })
  description: string;
  @Prop({ type: String })
  logoUrl: string;
  @Prop({ type: String })
  websiteUrl: string;
  @Prop({ type: String })
  emailAddress: string;
  @Prop({ type: String })
  phoneNumber: string;
  @Prop({ type: String })
  businessSignature: string;
  @Prop({ type: Boolean })
  isBlocked: boolean;
  @Prop({ type: Boolean })
  isApproved: boolean;
  @Prop({ type: Boolean })
  status: boolean;

  @Prop({ type: String })
  address: string;

  @Prop({ type: IdentitySchema })
  identity: IdentityInterface;

  @Prop({ type: DocumentsSchema })
  documents: DocumentsInterface;

  @Prop({ type: NotificationSchema })
  notification: NotificationInterface;
}

export const BusinessSchema = SchemaFactory.createForClass(Business);
BusinessSchema.plugin(softDeletePlugin);
