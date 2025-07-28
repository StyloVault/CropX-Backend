# Inventory API

Base URL: `/api/v1/inventory`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/get` | Retrieve paginated inventories for the authenticated user |
| GET | `/get/:id` | Retrieve a single inventory item |
| DELETE | `/delete/:id` | Delete an inventory item |
| POST | `/create` | Create a new inventory item |
| PATCH | `/update/:id` | Update an inventory item |
| GET | `/summary` | Get summary statistics for inventories |

Admin endpoints exist under `/admin/*` for managing inventories across users.

### Enums
- `InventoryStatus`: ACTIVE, INACTIVE, OUTOFSTOCK

### Sample Payload
```json
{
  "name": "Tomatoes",
  "quantity": 100,
  "unit": "kg"
}
```
