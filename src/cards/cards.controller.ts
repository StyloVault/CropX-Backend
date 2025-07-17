import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Roles } from 'src/common/decorator/roles';
import { AdminRolesGuard } from 'src/common/roles/admin.roles';
import { UserRolesGuard } from 'src/common/roles/user.roles';
import { LinkCardDto, TransferDto, CustomerDto, StatusDto } from './dto/card.dto';
import { CardsService } from './cards.service';

@Controller('api/v1/wallets')
export class CardsController {
  constructor(private readonly cardService: CardsService) {}

  @Post('')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  createWallet(@Req() req, @Body() body) {
    const { sID } = req.decoded;
    return this.cardService.createWallet(sID, body);
  }

  @Get('')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getUserWallet(@Req() req) {
    const { sID } = req.decoded;
    return this.cardService.getCardAccount({ user: sID });
  }
  @Get('card')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getUserCard(@Req() req) {
    const { sID } = req.decoded;
    return this.cardService.getCard({ user: sID });
  }

  @Get('account')
  getAccount() {
    return this.cardService.getAccount();
  }

  @Post('account/enquiry')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  verifyAccount(@Body() body) {
    return this.cardService.nameEnquiry(body);
  }

  @Post('transfer')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  transferFund(@Body() body: TransferDto, @Req() req) {
    const { sID, membershipId } = req.decoded;
    return this.cardService.transfer(sID, body);
  }

  @Post('card/holder')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  createCardHolder(@Body() body: CustomerDto, @Req() req) {
    console.log(req.decoded)
    const { sID, userRole } = req.decoded; 
    return this.cardService.requestCard(sID, body);
  }

  @Post('card/link')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  linkCard(@Req() req, @Body() linkCardDto: LinkCardDto) {
    const { sID } = req.decoded;
    return this.cardService.addCardToUser(sID, linkCardDto.cardNumber);
  }

  @Get('transaction/:id')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  singleUserTransaction(@Req() req, @Param('id') transactionId) {
    const { sID } = req.decoded;
    return this.cardService.getSingleTransactionforUser(sID, transactionId);
  }

  @Get('transactions')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  allUserTransaction(@Req() req, @Query() query) {
    const { sID } = req.decoded;
    return this.cardService.getUserTransactions(sID, query);
  }

  @Get('requested-card')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  requestedCard(@Req() req) {
    const { sID } = req.decoded;
    return this.cardService.getUserCardRequest(sID);
  }
  @Get('card-pin')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  getUserDefaultPin(@Req() req,) {
    const { sID } = req.decoded;
    return this.cardService.requestDefaultPin({ user: sID });
  }
  @Get('user-banks')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  userBank(@Req() req) {
    const { sID } = req.decoded;
    return this.cardService.getUserBankAccount(sID, {});
  }



  @Post('freeze-card')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  async freezeCard(@Res() res, @Req() req, @Body() body: StatusDto) {
    const { sID } = req.decoded;
    return await this.cardService.freezeCard(sID, res, body);
    
  }

  @Post('invoice/credit')
  @UseGuards(UserRolesGuard)
  @Roles('User', 'Company')
  async invoiceCredit(@Res() res, @Body() body) {
    return await this.cardService.invoicePayment(body, res);
  }

  //Admin Endpoints

  @Get('admin/wallets')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetWallets(@Query() query) {
    return this.cardService.getWallets(query);
  }

  @Get('admin/accounts')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetAccounts(@Query() query) {
    return this.cardService.getBankAccounts(query);
  }

  @Get('admin/single-wallet/:id')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetSingleWallet(@Param('id') id) {
    return this.cardService.getSingeWallet({ user: id });
  }

  @Get('admin/card-requests')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetCardRequest(@Query() query) {
    return this.cardService.getCardRequests(query);
  }

  @Get('admin/card-request')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetSingleCardRequest(@Body() body) {
    return this.cardService.getSingleCardRequest(body);
  }

  @Post('admin/update-card-request')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminUpdateCardRequest(@Body() body) {
    const { cardRequestID, status } = body;
    return this.cardService.updateCardReqests(
      { _id: cardRequestID },
      { cardDeliveryStatus: status },
    );
  }

  @Get('admin/transactions/')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetTransaction(@Query() query) {
    return this.cardService.getTransactions({}, query);
  }

  @Get('admin/transactions/:id')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetTransactions(@Query() query, @Param('id') id) {
    return this.cardService.getTransactions({ user: id }, query);
  }

  @Get('admin/transaction/:id')
  @UseGuards(AdminRolesGuard)
  @Roles('SuperAdmin')
  adminGetSingleTransaction(@Param('id') id) {
    return this.cardService.getSingleCardRequest({ _id: id });
  }


}
