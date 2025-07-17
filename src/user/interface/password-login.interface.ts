import { Document } from 'mongoose';

export interface PasswordInterface extends Document {
  user: any;
  password: string;
}

export interface LoginInterface extends Document {
  user: any;
  deviceName: string;
  userAgent: object;
  ipAddress: string;
}

export interface UserDeviceInterface extends Document {
  deviceName: string;
  deviceToken: string;
  deviceVerified: boolean;
  blackListDevice: boolean;
}

export interface UserDataInterface extends Document {
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  country: string;
  state: string;
  address: string;
}
