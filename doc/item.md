# Item API

Base URL: `/api/v1/item`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| GET | `/get` | Retrieve paginated items for the authenticated user |
| GET | `/get/:id` | Retrieve a single item |
| PATCH | `/update/:id` | Update item price |
| GET | `/admin/all` | List items across all businesses (admin) |
| GET | `/admin/user/:id` | List items for a specific user (admin) |
| GET | `/admin/item/:id` | Retrieve any item by id (admin) |

### Update Payload
```json
{
  "price": 25
}
```
