import { IsMongoId, IsNotEmpty, IsNumber,ValidateNested,IsObject, IsEnum, IsNumberString, IsString, IsOptional } from 'class-validator'
import { Types } from 'mongoose';
import { Type } from 'class-transformer';
import { StatusEnum } from '../interface/card.enum';

export class CardDto {
    @IsNotEmpty()
    userData: any;

    @IsNotEmpty()
    billingAddress: any;

}


export class LinkCardDto {
    @IsString()
    cardNumber: string;
}


export class TransferDto {
    @IsString()
    nameEnquiryReference: string;
    @IsString()
    beneficiaryBankCode: string;
    @IsString()
    beneficiaryAccountNumber: string;
    narration?: string;
    @IsNumber()
    amount: number;
}

class UserDataDto {
    @IsString()
    firstName: string;

    @IsString()
    lastName: string;
}

class BillingAddressDto {
    @IsString()
    line1: string;

    @IsString()
    city: string;

    @IsString()
    state: string;

    @IsOptional()
    postalCode: string;

    @IsString()
    country: string;
}

export class CustomerDto {
    @IsString()
    name: string;

    @ValidateNested()
    @Type(() => UserDataDto)
    @IsObject()
    userData: UserDataDto;

    @ValidateNested()
    @Type(() => BillingAddressDto)
    @IsObject()
    billingAddress: BillingAddressDto;
}

export class StatusDto {
    @IsEnum(StatusEnum)  
    status: StatusEnum;
}