import {BadRequestException, Injectable, InternalServerErrorException} from "@nestjs/common";
import {InjectModel} from "@nestjs/mongoose";
import {Model} from "mongoose";
import {ProductUnit, Transaction} from "./transactionSchema";
import {InventoryRepository} from "src/inventory/schema/inventory.repository";
import {TransactionStatus, TransactionSubType, TransactionType} from "../enum/transactionEnum";

@Injectable()
export class TransactionRepository {

    constructor(
        @InjectModel('Transaction') private readonly transactionModel: Model<Transaction>,
        @InjectModel('ProductUnit') private readonly productUnitModel: Model<ProductUnit>,
    ) {
    }

    public async createTransaction(data: any): Promise<Transaction> {
        try {
            return await this.transactionModel.create(data);
        } catch (error) {
            throw new Error('Transaction could not be created');
        }
    }

    public async createProductUnit(data): Promise<ProductUnit> {
        try {
            return await this.productUnitModel.create(data);
        } catch (error) {
            throw new Error('Unit could not be created');
        }
    }

    public async getAll(query, sID: string | null = null) {
        let {
            status,
            type,
            transactionReference,
            externalReference,
            subtype,
            search,
            page,
            limit,
            sort,
            fields,
            numericFilters
        } = query;
        this.validateQueryParameters({status, type, subtype});

        const queryObject: any = {};

        if (sID) queryObject.businessId = sID;
        if (status) queryObject.status = status;
        if (type) queryObject.type = type;
        if (subtype) queryObject.subtype = subtype;
        if (transactionReference) queryObject.transactionReference = transactionReference;
        if (externalReference) queryObject.externalReference = externalReference;
        if (search) queryObject.description = {$regex: search, $options: 'i'};

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
            const options = ['totalAmount', 'totalQuantity'];
            filters = filters.split(',').forEach((item) => {
                const [field, operator, value] = item.split('-');
                if (options.includes(field)) {
                    queryObject[field] = {[operator]: Number(value)};
                }
            });
        }
        let result: any = this.transactionModel.find(queryObject).populate({
            path: 'unitIds',
            populate: [{ path: 'productId' }],
          })
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
            transactions: response,
            count: response.length,
            numOfPages,
        };
    }


    validateQueryParameters({status, type, subtype}) {
        if (status && !Object.values(TransactionStatus).includes(status)) {
            throw new BadRequestException('Invalid status parameter');
        }

        if (type && !Object.values(TransactionType).includes(type)) {
            throw new BadRequestException('Invalid type parameter');
        }

        if (subtype && !Object.values(TransactionSubType).includes(subtype)) {
            throw new BadRequestException('Invalid subtype parameter');
        }
    }

    async transactionSummary(sID) {

        const incomeTransactions = await this.transactionModel.countDocuments({
            businessId: sID,
            type: TransactionType.INCOME
        }).exec();
        const salesExpenses = await this.transactionModel.countDocuments({
            businessId: sID,
            type: TransactionType.EXPENSE,
            subtype: TransactionSubType.SALES
        }).exec();
        const usageExpenses = await this.transactionModel.countDocuments({
            businessId: sID,
            type: TransactionType.EXPENSE,
            subtype: TransactionSubType.USAGE
        }).exec();

        return {
            income: incomeTransactions,
            sales: salesExpenses,
            usage: usageExpenses,
        };
    }

    async getProductUnit(data: any) {
        const productUnit = await this.productUnitModel.findOne(data)

        if (!productUnit) {
            throw new Error('Product Unit not found');
        }

        return productUnit;
    }

    async getSingleTransaction(data: any) {
        const transaction = await this.transactionModel.findOne(data).populate({
            path: 'unitIds',
        });
        if (!transaction) {
            throw new Error('transaction not found');
        }

        return transaction;
    }

    async updateTransaction(search: any, data: any) {
        return await this.transactionModel.findOneAndUpdate(search, data, {
            new: true,
        });
    }

    public async deleteSingleTransaction(data: any): Promise<void> {

        const transaction = await this.transactionModel.findOne(data).exec()

        if (!transaction) {
            throw new Error('transaction not found');
        }

        await transaction.deleteOne();
    }
}