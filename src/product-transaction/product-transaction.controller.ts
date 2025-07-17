import {Body, Controller, Delete, Get, Param, Post, Query, Req, Res, UseGuards} from '@nestjs/common';
import {ProductTransactionService} from './product-transaction.service';
import {UserRolesGuard} from 'src/common/roles/user.roles';
import {Roles} from 'src/common/decorator/roles';
import {TransactionDTO} from './dto/transactionDto';
import {Response} from 'express';
import {Permissions} from 'src/common/decorator/permission';
import {PermissionsGuard} from 'src/common/roles/permission.role';
import {AdminRolesGuard} from "../common/roles/admin.roles";

@Controller('api/v1/inventory/transaction')
export class ProductTransactionController {
    constructor(private readonly transactionService: ProductTransactionService,) {
    }

    @Get('/get/:id')
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    getTransaction(@Req() req, @Param('id') id: string, @Res() res) {
        const {sID} = req.decoded
        return this.transactionService.getOneTransaction(id, sID, res);
    }

    @Get('/get/')
    @Roles('User', 'Company')
    @UseGuards(UserRolesGuard)
    getTransactions(@Req() req, @Query() body: any, @Res() res: Response) {
        const {sID} = req.decoded
        return this.transactionService.getAllTransactions(body, sID, res);
    }

    @Delete('/delete/:id')
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    deleteTransaction(@Req() req, @Param('id') id: string, @Res() res) {
        const {sID} = req.decoded
        return this.transactionService.deleteOneTransaction(id, sID, res);
    }


    @Post('/create')
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    createTransaction(@Req() req, @Body() body: TransactionDTO, @Res() res) {
        return this.transactionService.createProductTransaction(req.decoded, body, res)
    }

    @Get('/summary')
    @UseGuards(UserRolesGuard)
    @Roles('User', 'Company')
    transactionSummary(@Req() req, @Res() res: Response) {
        const {sID} = req.decoded
        return this.transactionService.getSummary(sID, res)
    }


    // Admin


    @Get('/admin/all')
    @UseGuards(AdminRolesGuard)
    @Roles('Admin')
    getAllInventories(@Query() body: any, @Res() res: Response) {
        return this.transactionService.getTransactions(body, res)
    }


    @Get('/admin/user/:id')
    @UseGuards(AdminRolesGuard)
    @Roles('Admin')
    getUserInventories(@Param('id') id, @Query() body: any, @Res() res: Response) {
        return this.transactionService.getAllUserTransactions(body, id, res)
    }


    @Get('/admin/inventory/:id')
    @UseGuards(AdminRolesGuard)
    @Roles('Admin')
    getSingleInventories(@Param('id') id, @Res() res: Response) {
        return this.transactionService.getTransactions(id, res)
    }


}

