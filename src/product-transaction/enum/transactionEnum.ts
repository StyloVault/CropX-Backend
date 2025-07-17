export enum TransactionStatus {
   SETTLED = "SETTLED",
    INACTIVE='INACTIVE',
    OUTOFSTOCK='OUTOFSTOCK',
}

export enum TransactionType {
    INCOME = 'INCOME',
    EXPENSE = 'EXPENSE',
}

export enum TransactionSubType {
    SALES = 'SALES',
    STOCK = 'STOCK',
    USAGE = 'USAGE',
    DESTROYED = 'DESTROYED',
}

// export const SubTypeMapping: Record<TransactionType, TransactionSubType[]> = {
//     [TransactionType.INCOME]: [TransactionSubType.STOCK],
//     [TransactionType.EXPENSE]: [TransactionSubType.SALES, TransactionSubType.USAGE, TransactionSubType.DESTROYED],
// };

// export const isValidSubType = (type: TransactionType, subtype: TransactionSubType): boolean => {
//     const allowedSubTypes = SubTypeMapping[type];
//     return allowedSubTypes ? allowedSubTypes.includes(subtype) : false;
// };