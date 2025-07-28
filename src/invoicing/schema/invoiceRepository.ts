import { BadRequestException, Injectable } from "@nestjs/common";
import { InjectModel } from '@nestjs/mongoose';
import { Model, Types } from 'mongoose';
import { Invoice } from './invoiceschema';
import { InvoiceDTO } from './../dto/invoiceDto';
import { CustomerRepository } from 'src/customer/schema/customer.repository';
import { InvoiceStatus } from "../enum/invoiceEnum";

@Injectable()
export class InvoiceRepository {
   private invoice : Promise<Invoice>;
  constructor(
    @InjectModel('Invoice') private readonly invoiceModel: Model<Invoice>,
    private readonly customerRepository: CustomerRepository,
        ) {  }
        

   public async createInvoice( sID: string, body : InvoiceDTO) : Promise<Invoice> {
    try {
        return await this.prepareInvoice(sID, body)
    } catch (error) {
        throw new Error('Invoice could not be created');
    }
   }


    public async updateOverdue() {
       await this.invoiceModel.updateMany(
            { 
              due_date: { $lt: new Date() },
              status : {$ne : InvoiceStatus.OVERDUE} 
            },
            { $set: { status: InvoiceStatus.OVERDUE } }
          );
    }
      
  public async getAll(query, sID: string |null = null) {
  
    let queryObject: any = {};
    let { status, search, page, limit, sort, fields, numericFilters } = query;

    if (status && !Object.values(InvoiceStatus).includes(status))  {
       throw new BadRequestException('Query Parameter Not Found');
  } 

    if (status) {
      queryObject.status = status;
    }
    if(search) {
      queryObject.title =  { $regex: search, $options: 'i' };
    }      
    if(sID) {
      queryObject['business.id'] = sID;
     }


    if (numericFilters) {
      const operatorMap = {
        '>': '$gt',
        '>=': '$gte',
        '=': '$eq',
        '<': '$lt',
        '<=': '$lte',
      };
  
      const regEx = /\b(<|>|>=|=|<|<=)\b/g;
      let filters = numericFilters.replace(
        regEx,
        (match) => `-${operatorMap[match]}-`
      );
      const options = ['totalAmount', 'discount'];
      filters = filters.split(',').forEach((item) => {
        const [field, operator, value] = item.split('-');
        if (options.includes(field)) {
          queryObject[field] = { [operator]: Number(value) };
        }
      });
  
    }
    let result :any = this.invoiceModel
      .find(queryObject)
      .populate('customer');
  
    if (sort) {
      const sortList = sort.split(',').join(' ');
      result = result.sort(sortList);
    } else {
      result = result.sort('createdAt');
    }
  
    if (fields) {
      const fieldsList = fields.split(',').join(' ');
      result = result.select(fieldsList);
    }
  
    page = Number(page) || 1;
    limit = Number(limit) || 10;
    const skip = (page - 1) * limit;
  
    result = result.skip(skip).limit(limit);
    const response = await result.exec(); 
    const numOfPages = Math.ceil(response.length / limit);

  
    return {
      invoices : response,
      count: response.length,
      numOfPages,
    };
  }
  
  public async getOne(id: string) : Promise<Invoice> {
     const invoice =  await this.invoiceModel
      .findById(id)
      .populate('customer')

     if(!invoice) {
        throw new Error('Invoice not found');
     }
     return invoice;
  }

    async getSingleInvoice(data) {
        const invoice =  await this.invoiceModel
          .findOne(data)
          .populate('customer')
          .exec();

        if(!invoice) {
          throw new Error('Invoice not found');
      }
      return invoice;
    } 
    
    public async deleteOne(data: any) : Promise<void> {
        
      const invoice =  await this.invoiceModel.findOne(data).exec()

      if(!invoice) {
          throw new Error('Invoice not found');
      }

      await invoice.deleteOne();
  }
  
    private async prepareInvoice(sID:string, body : InvoiceDTO) {
        
    const customer = await this.customerRepository.getSingleCustomer({ _id: body.customerId, businessId: sID });
    if (!customer) {
        throw new BadRequestException('Invalid customer provided');
    }

    let data = {
        title :  body.title,
        customer : customer._id,
        business : {
            id : sID,
            embedLogo : body.business.embedLogo,
            embedSignature : body.business.embedSignature
        },
        invoiceId : this.generateInvoiceReference(),

        items: body.items.map((item) => ({
            name: item.name || null,
            price: item.price || null,
            unitOfMeasure: item.unitOfMeasure || null,
            quantity: item.quantity || null,
            description: item.description || null,
          })),

        due_date : body.due_date,
        delivery : body.delivery,
        discount : body.discount
        }

        return await this.invoiceModel.create(data);
    }
    async updateInvoice(search, data) {
      return await this.invoiceModel.findOneAndUpdate(search, data, {
        new: true,
      });
    }

      
   

private generateInvoiceReference(): string {
const randomPart = String(Math.floor(100000 + Math.random() * 900000));
const currentTimestamp = Math.floor(new Date().getTime() / 1000);
const invoiceReference = `IV|${currentTimestamp}${randomPart}`;

return invoiceReference;
}

}
