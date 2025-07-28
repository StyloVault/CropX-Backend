# Product & News API

Base URL: `/api/v1/products`

This module manages products, news posts and daily prices.

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/inc` | Create a product (admin only) |
| GET | `/inc` | List products |
| GET | `/inc/:id` | Get a single product |
| PATCH | `/inc` | Update product status (admin only) |
| POST | `/news` | Create product news |
| GET | `/news` | List news items |
| GET | `/news/:id` | Get a single news post |
| PATCH | `/news` | Update news post |
| POST | `/subscription` | Subscribe to product updates |
| DELETE | `/subscription` | Remove subscription |
| GET | `/prices` | List daily prices |
| POST | `/prices` | Create daily price |
| GET | `/prices/:id` | Get a price record |
| PATCH | `/price` | Update price |
| GET | `/prices/graph/:id` | Graph data for product price |

### Enums
- `TransactionType`: INCOME, EXPENSE
- `TransactionSubType`: SALES, STOCK, USAGE, DESTROYED

### Example: Create Product
```json
{
  "name": "Wheat",
  "description": "grains",
  "status": "ACTIVE"
}
```
