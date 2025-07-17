import { Injectable, NotFoundException } from "@nestjs/common";
import { abort } from "process";
import { AppConfig } from "src/config.schema";
import { SafeHaveService } from "../services/safehaven.service";
import { Invoice } from "src/invoicing/schema/invoiceschema";

  @Injectable()
  export class Utils {

   constructor(private readonly safeHavenService : SafeHaveService ){
   }

   async createInvoiceAcct(invoice : Invoice) {
    try {
        const account = await this.safeHavenService.createVirtualAccount({
          validFor: 900,
          settlementAccount : {
            bankCode : AppConfig.SAFEHAVEN_DEFAULT_BANK_CODE,
            accountNumber: AppConfig.SAFEHAVEN_DEFAULT_ACCOUNT
          },
          accountName : invoice.title,
          amountControl : "Fixed",
          amount: invoice.total,
          callbackUrl: `${AppConfig.BASE_URL}/transfer`
          },
        );
       let response = account?.data?.data;

        if (!response) {
          throw new Error('Could not create this invoice')
        }
    
         return response;
      } catch (error) {
          throw new Error('Could not create this invoice'); 
      }
    }
      async getInvoiceAcct(id:string) {
        try {
       const account = await this.safeHavenService.getVirtualAccount(id)

        let response = account?.data?.data;
          console.log(response)
        if (!response) {
          throw new Error('Could not retrieve this invoice')
        }
        return response
        } catch (error) {
          throw new Error('Could not retrieve this invoice'); 
        }
      }
   
}
