import { Injectable } from "@nestjs/common";
import { Inventory } from "src/inventory/schema/inventorySchema";
import { ActivityRepository } from "src/common/activity/activity.repository";
import { PayGateService } from "src/common/services/pagate.service";

@Injectable()
export class OutOfStockEvent {
    constructor(
        private readonly activityRepository: ActivityRepository,
        private readonly payGateService: PayGateService,
    ) {}

    public async execute(inventory: Inventory): Promise<void> {
        if (!inventory) return;

        if (inventory.quantityAvailable <= 0) {
            await this.activityRepository.createActivity({
                businessId: inventory.businessId,
                description: `${inventory.name} is out of stock`,
                payload: inventory,
            });

            try {
                await this.payGateService.publishNotification({
                    type: 'OUT_OF_STOCK',
                    businessId: inventory.businessId,
                    inventoryId: inventory._id,
                });
            } catch (e) {
                // Notification errors should not break the flow
            }
        }
    }
}