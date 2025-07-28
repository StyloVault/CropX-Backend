# Cards & Wallets API

Base URL: `/api/v1/wallets`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/` | Create wallet for user |
| GET  | `/` | Get wallet information |
| GET | `/card` | Get linked card |
| GET | `/requested-card` | Get card request status |
| GET | `/card-pin` | Retrieve default card pin |
| POST | `/card/holder` | Request card holder creation |
| POST | `/card/link` | Link a physical card |
| GET | `/transactions` | List wallet transactions |
| GET | `/transaction/:id` | Get single transaction |
| POST | `/transfer` | Transfer funds between wallets |
| POST | `/freeze-card` | Freeze or unfreeze card |

Admin routes under `/admin/*` allow management of wallets and card requests.

### Enums
- `CardDeliveryStatus`: Pending, Dispatched, Delivered, Linked
- `BankName`: Safe Have MFB, Guaranty Trust Bank, Providus Bank

### Example: Transfer Funds
```json
{
  "amount": 2000,
  "toAccount": "1234567890"
}
```
