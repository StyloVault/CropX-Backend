import { MiddlewareConsumer, Module } from '@nestjs/common';
import { InventoryService } from './inventory.service';
import { InventoryController } from './inventory.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Inventory, InventorySchema } from './schema/inventorySchema';
import { InventoryRepository } from './schema/inventory.repository';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { ProductUnit, ProductUnitSchema, Transaction, TransactionSchema } from 'src/product-transaction/schema/transactionSchema';
import { Activity, ActivitySchema } from 'src/common/activity/activity.schema';
import { ActivityRepository } from './../common/activity/activity.repository';
import { ItemModule } from 'src/item/item.module';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Transaction.name, schema: TransactionSchema},
      {name: ProductUnit.name, schema: ProductUnitSchema},
      {name: Inventory.name, schema: InventorySchema},
      {name : Activity.name, schema : ActivitySchema}
    ]),
    ItemModule
  ],
  providers: [InventoryService,ActivityRepository, InventoryRepository, ApiResponse],
  controllers: [InventoryController],
  exports : [InventoryRepository]

})
export class InventoryModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude(
      // { path: 'invoice/payment', method: RequestMethod.POST }, 
      // { path: 'invoice/transfer', method: RequestMethod.POST }
    ).forRoutes(
      InventoryController
    )
  }
}
