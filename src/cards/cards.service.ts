import { BadRequestException, Injectable, InternalServerErrorException, NotFoundException, UnauthorizedException, UnprocessableEntityException } from '@nestjs/common';
import { Types } from 'mongoose';
import { amountToKobo, isPositiveInteger, isValidAmount } from 'src/common/utils/amount';
import { maskNumber } from 'src/common/utils/mask-number';
import { AppConfig } from 'src/config.schema';
import { TransactionStatus, TransactionType } from 'src/transactions/dto/transaction.enum';
import { TransactionRepository } from 'src/transactions/schema/transactionrepository';
import { CardDto, StatusDto } from './dto/card.dto';
import { BankName, CardDeliveryStatus, StatusEnum } from './interface/card.enum';
import { CardRepository } from './schema/card.repository';
import { Response } from 'express';
import { ApiResponse } from 'src/common/Helper/apiResponse';
import { error } from 'console';
import { SafeHaveService } from 'src/common/services/safehaven.service';
import { SudoService } from 'src/common/services/sudo.service';


@Injectable()
export class CardsService {
    constructor(private cardRepository: CardRepository, 
        private safeHavenService: SafeHaveService,
        private transactionRepository: TransactionRepository,
        private sudService: SudoService,
        private apiResponse: ApiResponse) {}

    async createWallet(user, userData) {
        const { firstName, lastName, phoneNumber, emailAddress } = userData;
        try {
            const verifyUser =  await this.cardRepository.getSingleCard({user});
            if(verifyUser) return {
                statusCode: 400,
                message: 'User already created'
            }
            // Generate Account Number
            const account = await this.safeHavenService.createVirtualAccount({
                accountName : firstName + " " + lastName,
                externalReference: user,
                validFor : 900,
                amountControl : "OverPayment",
                amount : 1,
                callbackUrl: `${AppConfig.APP_URL}/api/v1/hooks/${AppConfig.SAFEHAVE_FUNDING_HOOK}`,
                settlementAccount: {
                    bankCode: AppConfig.SAFEHAVEN_DEFAULT_BANK_CODE,
                    accountNumber: AppConfig.SAFEHAVEN_DEFAULT_ACCOUNT
                }
            });
            const newAccount = await this.cardRepository.addCard({user});
            if(account.hasOwnProperty('data')){
                console.log(account.data.statusCode);
                if(account.data.statusCode == 200){
                        const accountNumber = account.data.data.accountNumber;
                        const accountName = account.data.data.accountName;
                        await this.cardRepository.createAccountDetail({
                            card: newAccount._id,
                            accountNumber: accountNumber,
                            accountName: accountName,
                            bankName: BankName.SAFE_HAVEN,
                            metadata: account.data,
                        })
                        return {
                          statusCode: 200,
                          message: 'Account created for User'
                      }
                }
            }
            
           throw error      
        } catch (error) {
            console.log(error);
            throw new InternalServerErrorException('Unable to create account at the moment, try again')
        }
    }

    async getCardAccount(data){
        try {
            const card = await this.cardRepository.getSingleCard(data);
    
            if(!card) throw new NotFoundException('User card not found')
            const cardAccount = await this.cardRepository.getSingleAccountDetail({card: card._id})
            return {
                statusCode: 200,
                message: 'User Card account fetched',
                data: cardAccount,
            }
        } catch (error) {
            throw new NotFoundException('User card not found')
        }
    }

    async getCard(data){
        try {
            const card = await this.cardRepository.getSingleCard(data);
    
            if(!card) throw new NotFoundException('User card not found')

            return {
                statusCode: 200,
                message: 'User Card fetched',
                data: card,
            }
        } catch (error) {
            throw new NotFoundException('User card not found')
        }
    }

    async requestDefaultPin(data){
        try {
            const card = await this.cardRepository.getSingleCard(data);
    
            if(!card) throw new NotFoundException('User card not found')

            let result = await this.sudService.sendDefaultCardPin(card.cardID)

            if(result.data && result.data.statusCode != 200) {
                return {
                    statusCode: 400,
                    message: 'Error occured',
                    data: [],
                }
            }

            return {
                statusCode: 200,
                message: 'Success',
                data: [],
            }

        } catch (error) {
            throw new NotFoundException('User card not found')
        }
    }


    async getCardAccounts(data, search){
        try {
            const cardAccounts = await this.cardRepository.fetchCards(data, search);
            return {
                statusCode: 200,
                message: 'Card accounts fetched',
                data: cardAccounts,
            }
        } catch (error) {
            
        }
    }

    async createCard(cardDto : CardDto, user:{userID: Types.ObjectId, userType: string, membershipId?: Types.ObjectId}){
        const cardType = user.membershipId ? 'business' : 'individual';
    }

    async getAccount() {
        const banks =  await this.safeHavenService.getBank();

        if(!banks){
            throw new NotFoundException('Unable to verify account now')
        }
        const response = banks.data;
        if(response.statusCode !== 200)
        {
        throw new NotFoundException(response.message)
        }


        return {
            statusCode: 200,
            message: 'Bank account number fetched successfully',
            data: banks.data,
        };
    }

    async nameEnquiry(data: {bankCode: string, accountNumber: string}) {
        const { bankCode, accountNumber } = data;
        const enquiry = await this.safeHavenService.nameEnquiry({
            bankCode,
            accountNumber,
        })

        if(!enquiry){
            throw new NotFoundException('Unable to verify account now')
        }
        const response = enquiry.data;
        if(response.statusCode !== 200)
        {
        throw new NotFoundException(response.message)
        }

        return {
        statusCode: 200,
        message: 'Account details fetched successfully',
        data: response.data,
        }
    }

    async transfer(userID: Types.ObjectId, data:{
        nameEnquiryReference: string;
        beneficiaryBankCode: string;
        beneficiaryAccountNumber: string;
        narration?: string;
        amount: number;}) {
            console.log(data)
            if(!isPositiveInteger(data.amount) || !isValidAmount(data.amount)) throw new BadRequestException('Unauthorized amount');
            const cardInfo =  await this.cardRepository.getSingleCard({user: userID, suspend: false})
            if(!cardInfo) throw new UnauthorizedException('User not Authorized for transfer');
            const debitAmount = this.tranasctionAmount(data.amount, 10);
            const koboAmount = amountToKobo(debitAmount)
            console.log(koboAmount, debitAmount)
                if (cardInfo.accountBalance < koboAmount) {
                    throw new BadRequestException('You currently do not have sufficient balance')
                }   
            // Create Transfer record
            const transfer = await this.transactionRepository.createTransaction({
                user : userID,
                card: cardInfo._id,
                amount: Number(data.amount),
                previousBalance :  cardInfo.accountBalance,
                newBalance : Number(cardInfo.accountBalance)
                 - Number(debitAmount),
                charges: 10,
                transactionType: TransactionType.EXTERNAL_TRANSFER,
                bankInfo: data,

            })
          // Debit customer
            const newBalance = await this.cardRepository.updateCard(
                {_id: cardInfo._id, accountBalance: {$gte : koboAmount}, suspend: false },
                {$inc: {accountBalance: (- Number(debitAmount))}});


            // Transfer
            const safeHavenResponse = await this.safeHavenService.transfer({
                nameEnquiryReference: data.nameEnquiryReference,
                beneficiaryAccountNumber: data.beneficiaryAccountNumber,
                beneficiaryBankCode: data.beneficiaryBankCode,
                narration: data.narration,
                amount: data.amount,
                paymentReference: transfer._id,
                saveBeneficiary: false
            })
            // Reverse if failed
            let transactionStatus;
            let statusMessage;
            let statusCode;
            if(!safeHavenResponse){
                transactionStatus = TransactionStatus.PENDING;
                statusMessage =  'Transaction Pending',
                statusCode = 200;
            }

            if(!safeHavenResponse.data){
                transactionStatus = TransactionStatus.PENDING;
                statusMessage =  'Transaction Pending',
                statusCode = 200;
            }
            const response = safeHavenResponse.data;
            if(response.statusCode == 200) {
                transactionStatus = TransactionStatus.SUCCESS;
                statusMessage =  'Transaction Successful',
                statusCode = 200;
            }

            if(response.statusCode == 400){
                transactionStatus = TransactionStatus.FAILED;
                statusMessage =  'Transaction Pending',
                statusCode = 400;

                await this.cardRepository.updateCard(
                    {_id: cardInfo._id},
                    {amount: {$inc: Number(debitAmount)}}
                )
            }

        const transactionUpdate =  await this.transactionRepository.updateTransaction(
            {_id: transfer._id},
            {transactionStatus, externalInformation: response}
        )
            // return
        return {
            statusCode,
            message: statusMessage,
            data: transactionUpdate
        }
    }


    async requestCard(user, cardData){
        const verifyUser =  await this.cardRepository.getSingleCard({user});
            if(!verifyUser) {
                throw new BadRequestException('User does not have a wallet')
            }

            if(verifyUser.customerCardId){
                throw new BadRequestException('User has existing card');
            }
            const debitAmount = AppConfig.CARD_CREATION_AMOUNT;
            console.log('Here',debitAmount);
            const koboAmount = amountToKobo(debitAmount)
            const card = await this.cardRepository.getSingleCard(
                {_id: verifyUser._id, accountBalance: {$gte : koboAmount}, suspend: false });
        
            
            if(!card)throw new BadRequestException(`Insufficient balance, make sure your balance is up to ${debitAmount}`)
        
            await this.cardRepository.updateCard(
                {_id: verifyUser._id, accountBalance: {$gte : koboAmount}, suspend: false },
                {$inc: {accountBalance: (- Number(debitAmount))}});
           
                cardData.billingAddress.postalCode = "200000";
            const cardCustomerData = await this.sudService.createCardHolder({
                type: 'individual',
                name: `${cardData.userData.firstName} ${cardData.userData.lastName}`,
                status: 'active',
                individual: cardData.userData,
                billingAddress: cardData.billingAddress
            });

            if(!cardCustomerData)throw new InternalServerErrorException('Internal issue, card request failed at the moment');
            if(!cardCustomerData.hasOwnProperty('data'))throw new InternalServerErrorException('Card request failed at the moment, try again');
            const response = cardCustomerData.data;
            if(response.statusCode !== 200) throw new UnprocessableEntityException('Card Issuer unable to profile account for card at the moment');

            
             await this.cardRepository.updateCard(
                {_id:  verifyUser._id},
                {
                    address: cardData.billingAddress,
                    userData: cardData.userData,
                    customerCardId: response.data._id
                }
            );

            //Create Transaction
            await this.transactionRepository.createTransaction({
                amount: debitAmount,
                user: verifyUser.user,
                previousBalance : card.accountBalance ,
                newBalance: Number(card.accountBalance) - Number(debitAmount),
                card: verifyUser._id,
                transactionType: TransactionType.CARD_CREATION,
                charges: 0,
                transactionStatus: TransactionStatus.SUCCESS,
              })
              console.log(verifyUser,card, user)
            //Create Record of Request
            await this.cardRepository.createCardRequest({
                card: card._id,
                user : card.user,
                address: cardData.billingAddress,
                userData: cardData.userData,
            })

            return{
                statusCode: 200,
                message: 'You account profile for physical card is successful'
            }

            
    }

    async freezeCard(user, res: Response, body : StatusDto){
      const card =  await this.cardRepository.getSingleCard({user, });
          if(!card) {
              throw new BadRequestException('User does not have a card')
          }

           let result = await this.sudService.updateCard(card.cardID, {status: body.status});
           result = result.data
            
           if(result.statusCode != 200) {
            return this.apiResponse.failure(res, 'Error freezing card', [], 400)
           }

           const state = body.status == StatusEnum.ACTIVE ? false : true;
           const queryState = body.status == StatusEnum.ACTIVE ? true : false

           let update = await this.cardRepository.updateCard(
            {_id: card._id, suspend: queryState},
            {suspend: state})

            if(!update) {
                return this.apiResponse.failure(res, "Update failed", [], 400)
            }
            const status =  body.status == StatusEnum.ACTIVE ? "unfreezed" : "freezed" 
            return this.apiResponse.success(res, `Card ${status} successfully`, [], 200)
  
        }


    async addCardToUser(user, cardNumber){
        const verifyUser =  await this.cardRepository.getSingleCard({user});
        if(!verifyUser) {
            throw new BadRequestException('User does not have a wallet')
        }

        const addCardResponse = await this.sudService.createCard({
            customerId: verifyUser.customerCardId,
            number: cardNumber,
            type: 'physical',
            status: 'active',
            currency: 'NGN',
            brand : 'Verve'
        });
        console.log(addCardResponse);
        if(!addCardResponse)throw new InternalServerErrorException('Internal issue, card request failed at the moment');
        if(!addCardResponse.hasOwnProperty('data'))throw new InternalServerErrorException('Card request failed at the moment, try again');
        const response = addCardResponse.data;
        if(response.statusCode !== 200){
            throw new BadRequestException(response.message)
        }

        const cardID = response.data._id
        const updatedCard = await this.cardRepository.updateCard({user}, {cardID ,cardNumber: maskNumber(cardNumber)})
        await this.cardRepository.updateCardRequest({card: verifyUser._id }, {cardDeliveryStatus: CardDeliveryStatus.LINKED})
        return {
            statusCode: 200,
            message: 'Card added successfully, change PIN on any ATM machine',
            data: updatedCard,
        }
    }

    async updateCardRequestStatus(cardID, status){
        const returnCard = await this.cardRepository.updateCardRequest(
            {card: cardID}, {cardDeliveryStatus: status} );
    }

    //Addition
    async getSingleTransactionforUser(sID, transactionID) {
        const wallet = await this.transactionRepository.getSingleTransaction({user: sID, _id: transactionID});
        if(!wallet)throw new NotFoundException('Not found')
        return {
            statusCode: 200,
            message: 'Wallet gotten successfully',
            data: wallet,
        }
    }

    async getUserTransactions(sID, query){
        return this.transactionRepository.fetchTransactions({user: sID}, query)
    }

    async getUserCardRequest(sID){
        const cardRequest= await this.cardRepository.getSingleCardRequest({user: sID});
        if(!cardRequest)throw new NotFoundException('Card Request not found');
        return {
            statusCode: 200,
            message: 'Card Request gotten successfully',
            data: cardRequest,
        }
    }

    async getUserBankAccount(sID, query) {
        return await this.cardRepository.getAccountDetails({user: sID}, query)
    }

    tranasctionAmount(amount: number, charge: number = 0){
        return Number(amount) + Number(charge);
    }


    //Admin Part


    async getWallets(query){
        return await this.cardRepository.fetchCards({}, query)
    }

    async getBankAccounts(query) {
        return await this.cardRepository.getAccountDetails({}, query)
    }

    async getSingeWallet(data) {
        const wallet = await this.cardRepository.getSingleCard(data);
        if(!wallet)throw new NotFoundException('Not found')
        return {
            statusCode: 200,
            message: 'Wallet gotten successfully',
            data: wallet,
        }
    }


    async getCardRequests(query){
        return await this.cardRepository.fetchCardRequests({}, query)
    }

    async updateCardReqests(search, data){
        const updatedCardRequest = await this.cardRepository.updateCardRequest(search, data);
        if(!updatedCardRequest)throw new NotFoundException('Card Request not found for update');
        return {
            statusCode: 200,
            message: 'Card updated successfully',
        }
    }   

    async getSingleCardRequest(data){   
        const cardRequest= await this.cardRepository.getSingleCardRequest(data);
        if(!cardRequest)throw new NotFoundException('Card Request not found');
        return {
            statusCode: 200,
            message: 'Card Request gotten successfully',
            data: cardRequest,
        }
    }

    async getTransactions(data, query){
        return await this.transactionRepository.fetchTransactions(data, query);
    }

    async getSingleTransaction(data) {
        const transaction = await this.transactionRepository.getSingleTransaction(data);
        if(!transaction)throw new NotFoundException('Transaction not found');

        return {
            statusCode: 200,
            message: 'Transaction fetched successfully',
            data: transaction,
        }
    }
      
    async invoicePayment(body: any, res: Response){
        const creditResponse = body;
        const userCard =  await this.cardRepository.getSingleCard({user :  creditResponse.sID})
    
        if(!userCard){
            return this.apiResponse.failure(res, "Failed, User doesn't exist" , [], 404)

        }
    
        //Create transaction record
        const transaction = await this.transactionRepository.createTransaction({
          amount: creditResponse.amount,
          previousBalance : userCard.accountBalance,
          newBalance : Number(userCard.accountBalance) + Number(creditResponse.amount),
          user: creditResponse.sID,
          card: userCard._id,
          transactionType: TransactionType.INVOICE_PAYMENT,
          charges: 0,
          transactionStatus: TransactionStatus.SUCCESS,
          externalInformation: body
        })
        //Update Account
          await this.cardRepository.updateCard(
          {_id: userCard._id},
          {$inc: {accountBalance:  Number(creditResponse.amount)}});
          
        return this.apiResponse.success(res, 'Success', [], 200)
      }
}


