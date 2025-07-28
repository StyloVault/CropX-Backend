import { IsEmail, IsOptional, IsString } from 'class-validator';

export class CustomerDTO {
  @IsString()
  name: string;

  @IsEmail()
  email: string;

  @IsString()
  phone: string;

  @IsString()
  @IsOptional()
  billingAddress: string;

  @IsString()
  @IsOptional()
  deliveryAddress: string;
}
