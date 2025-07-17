import {Injectable} from '@nestjs/common';
import {Response} from 'express';
import {ApiResponse} from 'src/common/Helper/apiResponse';
import {CreateTransactionAction} from './Actions/createTransactionAction';
import {TransactionDTO} from './dto/transactionDto';
import {TransactionRepository} from './schema/transaction.repository';
import {ActivityRepository} from 'src/common/activity/activity.repository';


@Injectable()
export class ProductTransactionService {
    constructor(
        private createTransactionAction: CreateTransactionAction,
        private apiResponse: ApiResponse,
        private transactionRepository: TransactionRepository,
        private activityRepository: ActivityRepository
    ) {
    }

    async createProductTransaction(decoded: any, body: TransactionDTO, res: Response) {
        try {
            const {sID, userId} = decoded
            const transaction = await this.createTransactionAction.execute(sID, body);
            this.createActivity(transaction, userId, sID, "Created Product Transaction");
            return this.apiResponse.success(res, 'Transaction created successfully', transaction, 201)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode);
        }
    }

    async createActivity(inventory, userId, sID, description) {
        await this.activityRepository.createActivity({
            businessId: sID,
            description: description,
            createdById: userId,
            payload: inventory
        })
    }

    async getOneTransaction(id: string, sID: string, res: Response) {
        try {
            return this.apiResponse.success(res, 'Transaction retreived successfully', await this.transactionRepository.getSingleTransaction({
                _id: id,
                businessId: sID
            }))
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }

    async getAllTransactions(body: any, sId: string, res: Response) {

        try {
            const transactions = await this.transactionRepository.getAll(body, sId);

            return this.apiResponse.success(res, 'Transaction sretrieved successfully', transactions)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }

    async getSummary(sID: string, res: Response) {
        try {
            const summary = await this.transactionRepository.transactionSummary(sID);
            return this.apiResponse.success(res, 'Transactions retrieved successfully', summary)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }

    async deleteOneTransaction(id: string, sID: string, res: Response) {
        try {
            await this.transactionRepository.deleteSingleTransaction({_id: id, businessID: sID})
            return this.apiResponse.success(res, 'Transaction  deleted successfully', [])
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }


    //Admin Endpoints

    async getTransactions(body: any, res: Response) {
        try {
            const transactions = await this.transactionRepository.getAll(body);

            return this.apiResponse.success(res, 'Transaction retreived successfully', transactions)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }

    async getAllUserTransactions(body: any, sId: string, res: Response) {
        try {
            const transactions = await this.transactionRepository.getAll(body, sId);

            return this.apiResponse.success(res, 'Transaction retreived successfully', transactions)
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }


    async getTransaction(id: string, res: Response) {
        try {
            return this.apiResponse.success(res, 'Transaction retreived successfully', await this.transactionRepository.getSingleTransaction({_id: id}))
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }

    async updateTransaction() {

    }

    async deleteTransaction(id: string, sID: string, res: Response) {
        try {
            await this.transactionRepository.deleteSingleTransaction({_id: id, businessID: sID})
            return this.apiResponse.success(res, 'Transaction  deleted successfully', [])
        } catch (error) {
            return this.apiResponse.failure(res, error.message, [], error.statusCode)
        }
    }
}