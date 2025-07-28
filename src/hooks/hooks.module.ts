import { Module } from '@nestjs/common';
import { HooksService } from './hooks.service';
import { HooksController } from './hooks.controller';
import { MongooseModule } from '@nestjs/mongoose';
import { Transaction, TransactionSchema } from 'src/transactions/schema/transaction.schema';
import { TransactionRepository } from 'src/transactions/schema/transactionrepository';
import { CardRepository } from 'src/cards/schema/card.repository';
import { Card, CardSchema, CardRequest, CardRequestSchema, AccountDetails, AccountDetailsSchema } from 'src/cards/schema/card.schema';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Card.name, schema: CardSchema},
      {name: Transaction.name, schema: TransactionSchema},
      {name: CardRequest.name, schema: CardRequestSchema},
      {name: AccountDetails.name, schema: AccountDetailsSchema }
    ])
  ],
  controllers: [HooksController],
  providers: [HooksService, TransactionRepository, CardRepository]
})
export class HooksModule {}
