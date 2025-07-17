import { MiddlewareConsumer, Module, NestMiddleware, RequestMethod } from '@nestjs/common';
import { CardRepository } from './schema/card.repository';
import { AxiosInterceptor } from 'src/common/services/axios.service';
import { MongooseModule } from '@nestjs/mongoose';
import { AccountDetails, AccountDetailsSchema, Card, CardRequest, CardRequestSchema, CardSchema } from './schema/card.schema';
import { Transaction, TransactionSchema } from 'src/transactions/schema/transaction.schema';
import { TransactionRepository } from 'src/transactions/schema/transactionrepository';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { SudoService } from 'src/common/services/sudo.service';
import { SafeHaveService } from 'src/common/services/safehaven.service';
import { CardsService } from './cards.service';
import { CardsController } from './cards.controller';

@Module({
  imports: [
    MongooseModule.forFeature([
      {name: Card.name, schema: CardSchema},
      {name: Transaction.name, schema: TransactionSchema},
      {name: CardRequest.name, schema: CardRequestSchema},
      {name: AccountDetails.name, schema: AccountDetailsSchema}
    ])
  ],
  controllers: [CardsController],
  providers: [
    CardsService, 
    SafeHaveService, 
    CardRepository, 
    AxiosInterceptor, 
    TransactionRepository,
    SudoService,
    ApiResponse
  ]
})
export class CardsModule{
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(
      CardsController ,
    )
  }
}
