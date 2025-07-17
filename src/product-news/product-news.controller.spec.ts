import { Test, TestingModule } from '@nestjs/testing';
import { ProductNewsController } from './product-news.controller';
import { ProductNewsService } from './product-news.service';

describe('ProductNewsController', () => {
  let controller: ProductNewsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductNewsController],
      providers: [ProductNewsService],
    }).compile();

    controller = module.get<ProductNewsController>(ProductNewsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
