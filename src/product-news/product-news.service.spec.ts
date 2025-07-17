import { Test, TestingModule } from '@nestjs/testing';
import { ProductNewsService } from './product-news.service';

describe('ProductNewsService', () => {
  let service: ProductNewsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ProductNewsService],
    }).compile();

    service = module.get<ProductNewsService>(ProductNewsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
