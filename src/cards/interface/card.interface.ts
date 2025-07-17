import { Document, Types } from "mongoose";

export interface CardInterface extends Document {
    user: Types.ObjectId,
    address: any;
    accountBalance: number;
    suspend: boolean;
    customerCardId: string;
    cardNumber: string;
    cardDetails: any;
    metadata: any;
    cardID:string
}

export interface CardRequestInterface extends Document {
    card: any;
    user: any;
    address: any;
    userData: string;
    cardDeliveryStatus: string;
    metadata: any;
}

export interface AccountDetailsInterface extends Document {
    card: any;
    accountNumber: string;
    accountName: string;
    bankName: string;
}