import { MiddlewareConsumer, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProductUnit, ProductUnitSchema, Transaction, TransactionSchema } from './schema/transactionSchema';

import { CreateTransactionAction } from './Actions/createTransactionAction';
import { LowStockEvent } from './events/lowStockEvent';
import { OutOfStockEvent } from './events/OutOfStockEvent copy';
import { TransactionRepository } from './schema/transaction.repository';
import { InventoryRepository } from 'src/inventory/schema/inventory.repository';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { Inventory, InventorySchema } from 'src/inventory/schema/inventorySchema';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { Activity, ActivitySchema } from 'src/common/activity/activity.schema';
import { ActivityRepository } from './../common/activity/activity.repository';
import { ProductTransactionService } from './product-transaction.service';
import { ProductTransactionController } from './product-transaction.controller';
import { PayGateService } from 'src/common/services/pagate.service';

@Module({
    imports: [
        MongooseModule.forFeature([
          {name: Transaction.name, schema: TransactionSchema},
          {name: ProductUnit.name, schema: ProductUnitSchema},
          {name: Inventory.name, schema: InventorySchema},
          {name : Activity.name, schema : ActivitySchema}
        ]), 
      ],
    controllers: [ProductTransactionController],
    providers: [
      ProductTransactionService,
      InventoryRepository,
      ActivityRepository,
      ApiResponse,
      CreateTransactionAction,
      LowStockEvent,
      OutOfStockEvent,
      TransactionRepository,
      PayGateService,
    ]
})
export class ProductTransactionModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude(
      // { path: 'invoice/payment', method: RequestMethod.POST }, 
      // { path: 'invoice/transfer', method: RequestMethod.POST }
    ).forRoutes(
      ProductTransactionController
    )
  }
}
