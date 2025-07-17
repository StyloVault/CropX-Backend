import { IsString, IsEnum, IsNumber, ValidateNested, IsArray} from 'class-validator';
import { Types } from 'mongoose';
import { TransactionStatus, TransactionType, TransactionSubType } from '../enum/transactionEnum';
import { Transform, Type, plainToClass } from 'class-transformer';



export class ProductUnitDTO {

    @IsString()
    productId: Types.ObjectId;

    @IsNumber()
    quantity: number;

}

export class TransactionDTO {
    @ValidateNested()
    @Type(() => ProductUnitDTO)
    @IsArray()
    @Transform(({ value }) => plainToClass(ProductUnitDTO, value))
    products : ProductUnitDTO[];

    @IsString()
    externalReference: string;

    @IsString()
    description: string;

    @IsEnum(TransactionStatus)
    status: TransactionStatus;

    @IsEnum(TransactionType)
    type: TransactionType;

    @IsEnum(TransactionSubType)
    subtype: TransactionSubType;

}