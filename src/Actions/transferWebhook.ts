import { Injectable } from "@nestjs/common";
import { CardRepository } from "src/cards/schema/card.repository";
import { TransactionRepository } from "src/transactions/schema/transactionrepository";
import { TransactionType, TransactionStatus } from "src/transactions/dto/transaction.enum";
import { InvoiceStatus } from "src/invoicing/enum/invoiceEnum";
import { InvoiceRepository } from "src/invoicing/schema/invoiceRepository";
import { ItemRepository } from "src/item/item.repository";
import { InventoryRepository } from "src/inventory/schema/inventory.repository";






@Injectable()
export class TransferWebhookAction {

     public invoice
     public payload: { sID: string; amount: number };
      constructor(
              private invoiceRepository :InvoiceRepository,
              private itemRepository: ItemRepository,
              private inventoryRepository: InventoryRepository,
              private cardRepository: CardRepository,
              private transactionRepository: TransactionRepository,
      ) {}

     async execute(request) {

        if (request.type !== 'transfer') {
            throw new Error('Invalid request type');
        }

        try {

            await (await this.getInvoice(request)).setPayload(request)
            await this.creditCustomer()
            await this.invoiceRepository.updateInvoice({ _id: this.invoice.id }, {
                status: InvoiceStatus.SETTLED,
                businessSettled: true,
            })
            await this.reduceInventory()

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

   setPayload(request): this {
    this.payload = {
        sID : this.invoice.business.id,
        amount : request.data['amount']
    }
    return this;
   }

   private async creditCustomer() {
    const amount = Number(this.payload.amount);
    const userCard = await this.cardRepository.getSingleCard({ user: this.payload.sID });
    if (!userCard) {
      throw new Error("User card not found");
    }
    await this.transactionRepository.createTransaction({
      amount,
      previousBalance: userCard.accountBalance,
      newBalance: Number(userCard.accountBalance) + amount,
      user: this.payload.sID,
      card: userCard._id,
      transactionType: TransactionType.INVOICE_PAYMENT,
      charges: 0,
      transactionStatus: TransactionStatus.SUCCESS,
      externalInformation: this.payload,
    });
    await this.cardRepository.updateCard(
      { _id: userCard._id },
      { $inc: { accountBalance: amount } },
    );
  }

  private async reduceInventory() {
    for (const item of this.invoice.items) {
      if (!item.id) continue;
      try {
        const invItem = await this.itemRepository.getItemById(item.id);
        if (invItem?.inventoryId) {
          await this.inventoryRepository.updateInventory(
            { _id: invItem.inventoryId },
            { $inc: { quantityAvailable: -item.quantity } },
          );
        }
      } catch (e) {
        // ignore errors to avoid failing webhook
      }
    }
  }
 

   
}
