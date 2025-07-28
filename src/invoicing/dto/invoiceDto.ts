import { IsString, IsObject, IsInt, IsNumber, IsOptional, ValidateNested, IsBoolean, IsArray } from 'class-validator';
import { Type, Transform, plainToClass } from 'class-transformer';

export class CustomerDTO {
    @IsString()
    name: string;

    @IsEmail({}, {message : "Please provide a Valid Customer Email"})
    email: string;

    @IsString()
    phone: string;

    @IsString()
    billingAddress: string;

    @IsString()
    deliveryAddress: string;
}

export class BusinessDTO {
   
    @IsBoolean()
    embedLogo: boolean;

    @IsBoolean()
    embedSignature: boolean;
}

export class ItemDTO {
    @IsString()
    @IsOptional()
    id: string;

    @IsString({message : "Please provide a Valid Item Name"})
    name: string;

    @IsInt({ message: 'Please provide a valid Item price' })
    price: number;

    @IsString({message : "Please provide a Valid Item Unit of Measure"})
    unitOfMeasure: string;

    @IsNumber({}, {message : "Please provide a Valid Item Quantity"})
    quantity: number;

    @IsString({message : "Please provide a Valid Item Description"})
    description: string;
}

export class InvoiceDTO {
    @ValidateNested()
    @Type(() => ItemDTO)
    @IsArray()
    @Transform(({ value }) => plainToClass(ItemDTO, value))
    items: ItemDTO[];

    @ValidateNested()
    @Type(() => BusinessDTO)
    @IsObject()
    business: BusinessDTO;

    @IsString()
    customerId: string;

    @IsString()
    title: string;

    @IsString()
    due_date: string;

    @IsNumber()
    @IsOptional()
    discount: number;

    @IsNumber()
    @IsOptional()
    tax: number;

    @IsString()
    @IsOptional()
    delivery: string;
}

export class IdDTO {

    @IsString()
    invoiceID: string;

} 

