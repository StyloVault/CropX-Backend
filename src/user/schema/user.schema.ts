import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Types } from 'mongoose';
import { softDeletePlugin } from 'soft-delete-plugin-mongoose';
import {
  UserDataInterface,
  UserDeviceInterface,
} from '../interface/password-login.interface';
import {
  AdminRole,
  OTPReason,
  UserRole,
  UserStatus,
} from '../interface/user.enum';
import { UserDeviceSchema } from './login.schema';

@Schema({ timestamps: true, collection: 'user_data' })
export class UserData {
  @Prop({ type: String, required: true })
  firstName: string;

  @Prop({ type: String, required: true })
  lastName: string;

  @Prop({ type: String })
  dateOfBirth: string;

  @Prop({ type: String })
  country: string;

  @Prop({ type: String })
  state: string;

  @Prop({ type: String })
  address: string;

  @Prop({ type: String })
  userImage: string;
}

export const UserDataSchema = SchemaFactory.createForClass(UserData);

@Schema({ timestamps: true, collection: 'users' })
export class User {
  @Prop({ type: String, required: true, unique: true })
  email: string;

  @Prop({ type: String, required: true, unique: true })
  phoneNumber: string;

  @Prop({ type: String, select: false })
  password: string;

  @Prop({ type: Boolean, default: false })
  passwordBlock: boolean;

  @Prop({ type: Number, default: 0 })
  passwordAttempt: number;

  @Prop({ type: Date })
  passwordUpdate: Date;

  @Prop({ type: Boolean, default: false })
  emailVerified: boolean;

  @Prop({ type: Boolean, default: false })
  phoneNumberVerified: boolean;

  @Prop({
    type: String,
    enum: UserRole,
    default: UserRole.USER,
    required: true,
  })
  userRole: UserRole;

  @Prop({
    type: String,
    enum: AdminRole,
  })
  adminRole: AdminRole;

  @Prop({ type: Date })
  adminRoleUpdated: Date;

  @Prop({ type: String, select: false })
  pin: string;

  @Prop({ type: Boolean, default: false })
  blocked: boolean;

  @Prop({ type: Date })
  pinUpdate: Date;

  @Prop({ type: String, required: true, default: UserStatus.ACTIVE })
  accountStatus: string;

  @Prop([{ type: UserDeviceSchema }])
  userDevices: Array<UserDeviceInterface>;

  @Prop({ type: UserDataSchema })
  userData: UserDataInterface;

  @Prop({type: String, index: true})
  referralCode: string;
}

export const UserSchema = SchemaFactory.createForClass(User);

UserSchema.plugin(softDeletePlugin);

@Schema({ timestamps: true, collection: 'otp_usage' })
export class OTPUsage {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: Types.ObjectId;

  @Prop({ type: String, required: true })
  otp: string;

  @Prop({ type: String, enum: OTPReason, required: true })
  otpReason: OTPReason;
}

export const OTPUsageSchema = SchemaFactory.createForClass(OTPUsage);

@Schema({ timestamps: true, collection: 'pins' })
export class UserPin {
  @Prop({ type: Types.ObjectId, ref: 'User' })
  user: User;

  @Prop({ type: String, required: true })
  pin: string;

  @Prop({ type: Number, default: 0 })
  pinAttempt: number;

  @Prop({ type: Boolean, default: false })
  pinBlock: boolean;
}

export const UserPinSchema = SchemaFactory.createForClass(UserPin);
