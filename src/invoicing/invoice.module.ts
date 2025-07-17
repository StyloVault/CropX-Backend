import {MiddlewareConsumer, Module, RequestMethod } from '@nestjs/common';
import { InvoiceController } from './invoice.controller';
import { InvoiceService } from './invoice.service';
import { InvoiceRepository } from './schema/invoiceRepository';
import { Invoice, InvoiceSchema } from './schema/invoiceschema';
import { MongooseModule } from '@nestjs/mongoose';
import { AuthMiddleware } from 'src/common/middleware/auth.middleware';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { CronJob } from './internal/cron';
import { ApiCall } from 'src/common/Helper/ApiCall';
import { AxiosInterceptor } from 'src/common/services/axios.service';
import { TransferWebhookAction } from 'src/Actions/transferWebhook';
import { Utils } from 'src/common/Helper/Utils';
import { SafeHaveService } from 'src/common/services/safehaven.service';
@Module({
    imports: [
        MongooseModule.forFeature([
          {name: Invoice.name, schema: InvoiceSchema},
        ])
      ],
    controllers: [InvoiceController],
    providers: [InvoiceRepository,CronJob, InvoiceService, AxiosInterceptor, TransferWebhookAction, ApiResponse, ApiCall,Utils, SafeHaveService]
    
  })
export class InvoiceModule {
    configure(consumer: MiddlewareConsumer) {
        consumer.apply(AuthMiddleware).exclude(
          { path: 'invoice/payment', method: RequestMethod.POST },
          { path: 'invoice/transfer', method: RequestMethod.POST }
        ).forRoutes(
          InvoiceController
        )
      }
}




