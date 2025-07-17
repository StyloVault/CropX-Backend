export interface TransactionInterface {
    user: any;
    card: any;
    bankInfo: any;
    amount: number;
    charges: number;
    transactionType: string;
    transactionStatus: string;
    metadata: any;
}