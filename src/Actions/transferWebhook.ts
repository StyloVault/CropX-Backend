import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Request } from "express";
import { Model } from "mongoose";
import { ApiCall } from "src/common/Helper/ApiCall";
import { RequestObject } from "src/common/Helper/RequestObject";
import { RequestType } from "src/common/enums/RequestType";
import { AppConfig } from "src/config.schema";
import { InvoiceStatus } from "src/invoicing/enum/invoiceEnum";
import { InvoiceRepository } from "src/invoicing/schema/invoiceRepository";






@Injectable()
export class TransferWebhookAction {

     public invoice
     public payload : Object;
     public url : string = `${AppConfig.CARD_BASE_URL}/invoice/credit`;

      constructor(private invoiceRepository :InvoiceRepository,
              private apiCall : ApiCall) {}

     async execute(request) {

        if (request.type !== 'transfer') {
            throw new Error('Invalid request type');
        }

        try {

            (await this.getInvoice(request))
                        .setPayload(request)
        
            const response = await this.boot()
             await this.ifSuccessful(response)
          
        } catch (error) {
            throw new Error(error.message)
        }
     
    }

   
    private async getInvoice(request): Promise<this> {

        this.invoice = await this.invoiceRepository.getSingleInvoice({
            accountNumber: request.data['creditAccountNumber'],
            status: { $ne: InvoiceStatus.SETTLED }
        });

        return this
    }

   async setPayload (request) {
    this.payload = {
        sID : this.invoice.business.id,
        amount : request.data['amount']
    }  
   }

   async boot() {
    const newRequest =  RequestObject.from(this.invoice.business.id, this.payload, 'User', this.url, RequestType.POST);
    const response = await this.apiCall.transport(newRequest)
    return response;
   }
  
   async ifSuccessful(response) {
    if(response.status >= 400) {
        await this.invoiceRepository.updateInvoice({_id : this.invoice.id} ,{
            status : InvoiceStatus.SETTLED,
        })  
        throw new Error(response.data.message)
    }

     await this.invoiceRepository.updateInvoice({_id : this.invoice.id} ,{
            status : InvoiceStatus.SETTLED,
            businessSettled : true
    });
   }
 

   
}
