import { Controller, Delete, Param, Query, Res } from '@nestjs/common';
import { InvoiceService } from './invoice.service';
import { Post, UseGuards,Get, Req, Body } from '@nestjs/common';
import { Roles } from 'src/common/decorator/roles';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import { IdDTO, InvoiceDTO } from './dto/invoiceDto';
import { Response } from 'express';

@Controller('api/v1/invoice')
export class InvoiceController {
    constructor(private readonly invoiceService: InvoiceService) {}

  
    @Post('payment') 
     async invoicePayment(@Req() req, @Body() {invoiceID: id}: IdDTO, @Res() res) {
      return await this.invoiceService.invoicePayment(id, res);  
 }
    @Post('transfer')
    async invoiceTransfer(@Req() req, @Body() body, @Res() res) {
      return await this.invoiceService.transferWebhook(body, res);
    }

    @Post('manual-pay/:id')
    @UseGuards(UserRolesGuard)
    @Roles('User')
    manualPay(@Param('id') id: string, @Res() res: Response) {
      return this.invoiceService.manualPayment(id, res);
    }
    
    @Get('/get/') 
    @UseGuards(UserRolesGuard)
    @Roles('User')
    getInvoices(@Req() req, @Query() body : any, @Res() res : Response) { 
        const {sID} = req.decoded
      return this.invoiceService.getAllInvoices(body, sID, res);
    }

    @Get('/get/:id') 
    @UseGuards(UserRolesGuard)
    @Roles('User')
    getInvoice( @Param('id') id :string,@Res() res ) {
      return this.invoiceService.getOneInvoice(id, res);
    }

    @Delete('/delete/:id') 
    @UseGuards(UserRolesGuard)
    @Roles('User')
    deleteInvoice(@Req() req, @Param('id') id :string, @Res() res ) {
        const {sID} = req.decoded
      return this.invoiceService.deleteInvoice(id, sID, res);
    }

    @Post('/create')
    @UseGuards(UserRolesGuard)
    @Roles('User')
    createInvoice(@Req() req, @Body() body : InvoiceDTO,@Res() res) {
        const {sID} = req.decoded
        return this.invoiceService.createInvoice(sID, body, res)
  }
}

