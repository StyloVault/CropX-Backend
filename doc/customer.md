# Customer API

Base URL: `/api/v1/customer`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/create` | Create a new customer for the business |
| GET | `/get` | List customers for the authenticated business |
| GET | `/get/:id` | Retrieve a single customer |
| POST | `/update/:id` | Update customer details |
| DELETE | `/delete/:id` | Remove a customer record |

### Sample Payload
```json
{
  "name": "John Doe",
  "phone": "+234111111111",
  "email": "john@example.com"
}
```
