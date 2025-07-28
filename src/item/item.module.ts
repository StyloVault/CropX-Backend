import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Item, ItemSchema } from './item.schema';
import { ItemRepository } from './item.repository';
import { ItemService } from './item.service';
import { ItemController } from './item.controller';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { InventoryRepository } from 'src/inventory/schema/inventory.repository';
import { Inventory, InventorySchema } from 'src/inventory/schema/inventorySchema';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Item.name, schema: ItemSchema },
      { name: Inventory.name, schema: InventorySchema },
    ]),
  ],
  controllers: [ItemController],
  providers: [ItemRepository, ItemService, ApiResponse, InventoryRepository],
  exports: [ItemRepository],
})
export class ItemModule {}
