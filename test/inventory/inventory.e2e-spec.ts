import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { InventoryController } from '../../src/inventory/inventory.controller';
import { InventoryService } from '../../src/inventory/inventory.service';
import { InventoryRepository } from '../../src/inventory/schema/inventory.repository';
import { ActivityRepository } from '../../src/common/activity/activity.repository';
import { ApiResponse } from '../../src/common/Helper/apiResponse';
import { InventoryDTO } from '../../src/inventory/dto/inventoryDto';
import { InventoryStatus } from '../../src/inventory/enum/inventoryEnum';

describe('Inventory routes (e2e)', () => {
  let app: INestApplication;
  const inventoryRepository = {
    createInventory: jest.fn(),
    updateInventory: jest.fn(),
    getAll: jest.fn(),
  };
  const activityRepository = { createActivity: jest.fn() };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [InventoryController],
      providers: [
        InventoryService,
        { provide: InventoryRepository, useValue: inventoryRepository },
        { provide: ActivityRepository, useValue: activityRepository },
        ApiResponse,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.use((req, _res, next) => {
      req.decoded = { sID: 'biz', userId: 'user' };
      next();
    });
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /api/v1/inventory/create', () => {
    const dto: InventoryDTO = {
      name: 'item',
      description: 'desc',
      unitOfMeasure: 'kg',
      productId: 'prod',
      costPrice: 5,
      sellingPrice: 10,
      productImage: 'img',
      status: InventoryStatus.ACTIVE,
      lowStockValue: 1,
      quantityAvailable: 2,
    };
    inventoryRepository.createInventory.mockResolvedValue({ _id: '1', ...dto });

    return request(app.getHttpServer())
      .post('/api/v1/inventory/create')
      .send(dto)
      .expect(201)
      .expect(res => {
        expect(res.body.status).toBe('success');
        expect(inventoryRepository.createInventory).toHaveBeenCalled();
      });
  });

  it('POST /api/v1/inventory/update/:id', () => {
    const dto: InventoryDTO = {
      name: 'item',
      description: 'desc',
      unitOfMeasure: 'kg',
      productId: 'prod',
      costPrice: 5,
      sellingPrice: 10,
      productImage: 'img',
      status: InventoryStatus.ACTIVE,
      lowStockValue: 1,
      quantityAvailable: 2,
    };
    inventoryRepository.updateInventory.mockResolvedValue({ _id: '1', ...dto });

    return request(app.getHttpServer())
      .post('/api/v1/inventory/update/1')
      .send(dto)
      .expect(201)
      .expect(res => {
        expect(res.body.status).toBe('success');
        expect(inventoryRepository.updateInventory).toHaveBeenCalled();
      });
  });

  it('GET /api/v1/inventory/get', () => {
    const summary = { inventories: [], count: 0, numOfPages: 1, currentPage: 1 };
    inventoryRepository.getAll.mockResolvedValue(summary);

    return request(app.getHttpServer())
      .get('/api/v1/inventory/get')
      .expect(200)
      .expect(res => {
        expect(res.body.status).toBe('success');
        expect(inventoryRepository.getAll).toHaveBeenCalled();
      });
  });
});
