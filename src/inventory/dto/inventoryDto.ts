import { IsString, IsOptional,  IsNumber, ValidateNested, IsBoolean , validate, IsArray, IsEnum} from 'class-validator';
import { InventoryStatus } from '../enum/inventoryEnum';




export class InventoryDTO {

    @IsString()
    productId: string;

    @IsString()
    description: string;

    @IsString()
    @IsOptional()
    productImage: string;

    @IsString()
    @IsOptional()
    unitOfMeasure: string;

    @IsOptional()
    status: InventoryStatus = InventoryStatus.ACTIVE;

    @IsString()
    name: string;

    @IsNumber()
    @IsOptional()
    lowStockValue: number;

    @IsNumber()
    @IsOptional()
    sellingPrice: number;

    @IsNumber()
    costPrice: number;

    @IsNumber()
    @IsOptional()
    quantityAvailable: number;
}

