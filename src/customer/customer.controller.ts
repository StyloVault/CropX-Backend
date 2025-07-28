import { Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards } from '@nestjs/common';
import { CustomerService } from './customer.service';
import { Roles } from 'src/common/decorator/roles';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import { CustomerDTO } from './dto/customerDto';
import { Response } from 'express';

@Controller('api/v1/customer')
export class CustomerController {
  constructor(private readonly customerService: CustomerService) {}

  @Post('/create')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  create(@Req() req, @Body() body: CustomerDTO, @Res() res: Response) {
    return this.customerService.createCustomer(req.decoded, body, res);
  }

  @Get('/get')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getCustomers(@Req() req, @Query() query: any, @Res() res: Response) {
    return this.customerService.getCustomers(query, req.decoded, res);
  }

  @Get('/get/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getCustomer(@Req() req, @Param('id') id: string, @Res() res: Response) {
    return this.customerService.getCustomer(id, req.decoded, res);
  }

  @Post('/update/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  updateCustomer(
    @Req() req,
    @Param('id') id: string,
    @Body() body: CustomerDTO,
    @Res() res: Response,
  ) {
    return this.customerService.updateCustomer(id, req.decoded, body, res);
  }

  @Delete('/delete/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  deleteCustomer(@Req() req, @Param('id') id: string, @Res() res: Response) {
    return this.customerService.deleteCustomer(id, req.decoded, res);
  }
}
