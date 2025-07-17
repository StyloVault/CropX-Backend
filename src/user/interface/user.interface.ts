import { Document } from 'mongoose';
import {
  UserDataInterface,
  UserDeviceInterface,
} from './password-login.interface';
import { AdminRole, OTPReason, UserRole } from './user.enum';

export interface UserInterface extends Document {
  email: string;
  phoneNumber: string;
  password: string;
  passwordAttempt: number;
  passwordBlock: boolean;
  passwordUpdate: Date;
  emailVerified: boolean;
  phoneNumberVerified: boolean;
  userRole: UserRole;
  blocked: boolean;
  pin: string;
  pinUpdate: Date;
  adminRole: AdminRole;
  adminRoleUpdated: Date;
  userDevice: UserDeviceInterface;
  userData: UserDataInterface;
  accountStatus: string;
  deletedAt: string;
}

export interface OTPInterface extends Document {
  user: any;
  otp: string;
  usage: OTPReason;
}
