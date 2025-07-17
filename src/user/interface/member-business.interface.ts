import { Document } from 'mongoose';

export class AddressInterface extends Document {
  street: string;
  city: string;
  state: string;
  country: string;
}

export class IdentityInterface extends Document {
  country: string;
  type: string;
  number: string;
  documentUrl: string;
}

export class DocumentsInterface extends Document {
  certificateUrl: string;
  utilityBillUrl: string;
}

export class NotificationInterface extends Document {
  street: string;
  city: string;
  state: string;
  country: string;
}

export class BusinessInterface extends Document {
  type: string;
  name: string;
  registrationNumber: string;
  registrationDate: string;
  category: string;
  description: string;
  logoUrl: string;
  websiteUrl: string;
  emailAddress: string;
  phoneNumber: string;
  authorizedSignature: string;
  isApproved: boolean;
  approvedAt: Date;
  updatedAt: Date;
  isBlocked: boolean;
  status: string;
  address: string;
  identity: IdentityInterface;
  documents: DocumentsInterface;
  notification: NotificationInterface;
}

export class MembershipInterface extends Document {
  user: any;
  business: any;
  status: string;
  isPrimary: boolean;
}

export class OperationTimeInterface extends Document {
  startTime: any;
  endTime: any;
}

export interface ActiveCardBusinessInterface extends Document {
  cardActiveAll: boolean;
  card_active_business: any;
}

export interface CardBankInterface extends Document {
  accountNumber: string;
  accountId: string;
  accountName: string;
}
