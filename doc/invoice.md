# Invoice API

Base URL: `/api/v1/invoice`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/payment` | Initiate invoice payment |
| POST | `/transfer` | Receive transfer webhook |
| GET | `/get` | List invoices for the user |
| GET | `/get/:id` | Retrieve a single invoice |
| DELETE | `/delete/:id` | Delete an invoice |
| POST | `/create` | Create a new invoice |

### Enums
- `InvoiceStatus`: Pending, Overdue, Settled

### Invoice Creation Payload
```json
{
  "title": "Produce Sale",
  "amount": 5000,
  "customerId": "<id>"
}
```
