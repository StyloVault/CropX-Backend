import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Types } from "mongoose";
import { InvoiceStatus } from "../enum/invoiceEnum";


@Schema({timestamps: true, collection:'invoices'})
export class Invoice {

    @Prop({ type: String })
    invoiceId : string

    @Prop({type: Object, required :  true})
    customer: {
        name : string
        email :  string
        phone : string
        billingAddress :  string
        deliveryAddress :  string
     };

     @Prop({type : Object})
     business : {
        id : string, 
        embedLogo : boolean,
        embedSignature : boolean
     }

     @Prop({ type: [Object] })
            items: {
            id?: string;
            name: string;
            price: number;
            unitOfMeasure: string;
            quantity: number;
            description: string;
     }[];

    @Prop({
        type : String,
        default : InvoiceStatus.PENDING
    })
    status: InvoiceStatus

    @Prop({
        type: String,
        required: true,
      })
    title: string;

    @Prop({type : Date})
     due_date : Date

     @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    discount : number

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    tax : number

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    delivery : number


    @Prop({type : Date})
     accountNumberExpirationDate : Date

     @Prop({
        type: String,
      })
      virtualAccountId : string;

      @Prop({
        type: String,
      })
      accountNumber : string;


      @Prop({
        type: Boolean,
        default : false
      })
      businessSettled : boolean;

    @Prop({
        type: Number,
        default: 0,
        required: true,
    })
    total : number

}

export const InvoiceSchema = SchemaFactory.createForClass(Invoice);

InvoiceSchema.pre('save', function (next) {
    let total = this.items.reduce((total, item) => total + item.price * item.quantity, 0);
    this.total = total + this.tax + this.delivery - this.discount;
    next();
});

InvoiceSchema.set('toObject', { getters: true });
InvoiceSchema.set('toJSON', { getters: true });