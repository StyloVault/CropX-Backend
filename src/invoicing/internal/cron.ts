import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { InvoiceRepository } from './../schema/invoiceRepository';

@Injectable()
export class CronJob {
  constructor(private invoiceRepository: InvoiceRepository) {}
  @Cron(CronExpression.EVERY_SECOND)
  handleUpdateInvoice() {
    // console.log('Update overdue invoices');
    // this.invoiceRepository.updateOverdue()
  }
}
