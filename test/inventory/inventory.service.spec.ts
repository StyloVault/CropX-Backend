import { Test, TestingModule } from '@nestjs/testing';
import { InventoryService } from '../../src/inventory/inventory.service';
import { InventoryRepository } from '../../src/inventory/schema/inventory.repository';
import { ApiResponse } from '../../src/common/Helper/apiResponse';
import { ActivityRepository } from '../../src/common/activity/activity.repository';
import { InventoryDTO } from '../../src/inventory/dto/inventoryDto';
import { InventoryStatus } from '../../src/inventory/enum/inventoryEnum';

describe('InventoryService', () => {
  let service: InventoryService;
  let inventoryRepository: any;
  let activityRepository: any;
  let apiResponse: ApiResponse;
  let res: any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InventoryService,
        { provide: InventoryRepository, useValue: { createInventory: jest.fn(), updateInventory: jest.fn(), getAll: jest.fn() } },
        { provide: ActivityRepository, useValue: { createActivity: jest.fn() } },
        ApiResponse,
      ],
    }).compile();

    service = module.get<InventoryService>(InventoryService);
    inventoryRepository = module.get<InventoryRepository>(InventoryRepository);
    activityRepository = module.get<ActivityRepository>(ActivityRepository);
    apiResponse = module.get<ApiResponse>(ApiResponse);
    res = { status: jest.fn().mockReturnThis(), json: jest.fn() };
  });

  it('preparePayload should attach businessId', () => {
    const body: InventoryDTO = {
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
    const payload = service.preparePayload('biz', body);
    expect(payload).toEqual({
      name: body.name,
      description: body.description,
      unitOfMeasure: body.unitOfMeasure,
      productId: body.productId,
      costPrice: body.costPrice,
      sellingPrice: body.sellingPrice,
      productImage: body.productImage,
      status: body.status,
      lowStockValue: body.lowStockValue,
      quantityAvailable: body.quantityAvailable,
      businessId: 'biz',
    });
  });

  it('createInventory should create and return success', async () => {
    const body: InventoryDTO = {
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
    const decoded = { sID: 'biz', userId: 'user' };
    const created = { id: '1', ...body };
    inventoryRepository.createInventory.mockResolvedValue(created);
    jest.spyOn(apiResponse, 'success');
    await service.createInventory(decoded, body, res);
    expect(inventoryRepository.createInventory).toHaveBeenCalledWith(expect.objectContaining({ businessId: 'biz' }));
    expect(activityRepository.createActivity).toHaveBeenCalled();
    expect(apiResponse.success).toHaveBeenCalledWith(res, 'Inventory created successfully', created, 201);
  });

  it('updateInventory should update and return success', async () => {
    const body: InventoryDTO = {
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
    const decoded = { sID: 'biz', userId: 'user' };
    const updated = { id: '1', ...body };
    inventoryRepository.updateInventory.mockResolvedValue(updated);
    jest.spyOn(apiResponse, 'success');
    await service.updateInventory(decoded, '1', body, res);
    expect(inventoryRepository.updateInventory).toHaveBeenCalledWith({ _id: '1', businessId: 'biz' }, expect.any(Object));
    expect(activityRepository.createActivity).toHaveBeenCalled();
    expect(apiResponse.success).toHaveBeenCalledWith(res, 'Inventory created successfully', updated, 201);
  });
});
