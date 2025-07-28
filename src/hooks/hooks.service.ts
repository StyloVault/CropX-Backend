import { BadRequestException, ForbiddenException, Injectable, UnauthorizedException } from '@nestjs/common';
import { AppConfig } from 'src/config.schema';
import { TransactionStatus, TransactionType } from 'src/transactions/dto/transaction.enum';
import { TransactionRepository } from 'src/transactions/schema/transactionrepository';
import { CardRepository } from 'src/cards/schema/card.repository';

@Injectable()
export class HooksService {

  private  SAFEHAVE_FUNDING_HOOK = AppConfig.SAFEHAVE_FUNDING_HOOK;
  private SUDO_AUTHORIZATION_HOOK = AppConfig.SUDO_AUTHORIZATION_HOOK;

  constructor(
    private cardRepository: CardRepository,
    private transactionRepository: TransactionRepository
  ){}
  main(req?: any | null, route?: any | null, query?: any | null) {
    console.log(req);
    switch (route) {
      case this.SAFEHAVE_FUNDING_HOOK:
        return this.safeHavenFunding(req);
      case this.SUDO_AUTHORIZATION_HOOK:
        return this.sudoAuthorization(req);
    
      default:
        return { statusCode: 400, message: 'Not found' };
    }
  }

  async safeHavenFunding(req: any){
    const creditResponse = req.body.data;
    console.log('Safe Have Credit: ' + req);

    const accountUser =  await this.cardRepository.getSingleAccountDetail({accountNumber: creditResponse.creditAccountNumber})

    if(!accountUser){
      throw new UnauthorizedException('Account not found');
    }

    //Create transaction record
    const transaction = await this.transactionRepository.createTransaction({
      amount: creditResponse.amount,
      previousBalance : accountUser.card.accountBalance,
      newBalance : Number(accountUser.card.accountBalance) + Number(creditResponse.amount),
      user: accountUser.card.user,
      card: accountUser.card._id,
      transactionType: TransactionType.BANK_FUNDING,
      charges: 0,
      transactionStatus: TransactionStatus.SUCCESS,
      externalInformation: req.body
    })
    //Update Account
    await this.cardRepository.updateCard(
    {_id: accountUser.card._id},
    {$inc: {accountBalance:  Number(creditResponse.amount)}});

    return {
      statusCode: 200,
      message: 'Success',
      resoponseCode: '00',
    };
  }

  async sudoAuthorization(req: any){
    console.log(req);
    if(req.methods == 'GET'){

      return {
          "statusCode":200,
          "responseCode":"00",
          "data":{
              "metadata":{
                  "foo":"bar"
              }
          }
      };
    }
    else if (req.methods == 'POST'){
      const { body } = req;
      const customerId =  body.object.customer.id;
      if(body.type == 'card.balance'){

        const cardDetails = await this.cardRepository.getSingleCard({customerCardId: customerId});
        if(!cardDetails)throw new ForbiddenException('Request false');

        return {
          statusCode: 200,
          responseCode: '00',
          data:{
            balance: cardDetails.accountBalance,
          }
        }

      }
      else if(body.type == 'authorization.request'){
        const cardDetails = await this.cardRepository.getSingleCard({customerCardId: customerId});
        if(!cardDetails)throw new ForbiddenException('Request false');
        const debitAmount = body.object.pendingRequest.amount;
        const koboAmount = amountToKobo(debitAmount)
        const card = await this.cardRepository.getSingleCard(
          {_id: cardDetails._id, accountBalance: {$gte : koboAmount}, suspend: false });
        
        if(!card){
          throw new BadRequestException(`Insufficient balance, make sure your balance is upto ${debitAmount}`);
        }

        const transaction = await this.transactionRepository.createTransaction({
          amount: debitAmount,
          user: cardDetails.user,
          previousBalance : card.accountBalance ,
          newBalance : Number(card.accountBalance)- Number(debitAmount) ,
          card: cardDetails._id,
          transactionType: TransactionType.CARD_WITHDRAWAL,
          charges: 0,
          transactionStatus: TransactionStatus.SUCCESS,
          externalInformation: body
        })
        // Update the card
        const updatedCard = await this.cardRepository.updateCard(
        {
          _id: cardDetails._id,
           accountBalance: { $gte: koboAmount },
         suspend: false
        },
        { $inc: { accountBalance: (-Number(debitAmount)) }
        });

        if (!updatedCard) {
          throw new BadRequestException('Card update failed.');
        }
        
        return {
          statusCode: 200,
          responseCode: "00",
          data: { 
              metadata: {
                  transactionId: transaction._id
              }
          }
        }

      }
      else if(body.type == 'transaction.refund'){
        const cardDetails = await this.cardRepository.getSingleCard({customerCardId: customerId});
        if(!cardDetails)throw new ForbiddenException('Request false');
        const debitAmount = body.object.pendingRequest.amount;
        const koboAmount = amountToKobo(debitAmount)
        const newBalance = await this.cardRepository.updateCard(
            {_id: cardDetails._id, accountBalance: {$gte : koboAmount}, suspend: false },
            {$inc: {accountBalance:  Number(debitAmount)}});
      }
      else{
        throw new ForbiddenException('Request false')
      }
    }
    else{
      throw new ForbiddenException('Request false')
    }
  }
}
function amountToKobo(debitAmount: any) {
  throw new Error('Function not implemented.');
}

