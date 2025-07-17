import { Test, TestingModule } from '@nestjs/testing';
import { ProductTransactionController } from './product-transaction.controller';
import { ProductTransactionService } from './product-transaction.service';

describe('ProductTransactionController', () => {
  let controller: ProductTransactionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductTransactionController],
      providers: [ProductTransactionService],
    }).compile();

    controller = module.get<ProductTransactionController>(ProductTransactionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
