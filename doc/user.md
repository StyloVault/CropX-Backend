# User & Authentication API

Base URL: `/api/v1/auth`

Key endpoints include:

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/create` | Register a new user |
| POST | `/login` | Login and obtain auth token |
| GET | `/user` | Get profile of authenticated user |
| POST | `/verify-pin` | Verify transaction pin |
| POST | `/create-pin` | Create transaction pin |
| POST | `/reset-password` | Request password reset |
| POST | `/new-password` | Complete password reset |
| PATCH | `/business/:businessId` | Update a business |
| GET | `/business` | List businesses for the user |
| PATCH | `/user` | Update user details |

More administration endpoints exist for creating admins, blocking users and managing roles.

### Enums
- `UserRole`: Admin, User, Company
- `UserStatus`: Suspended, Active, Inactive

### Sample Login Payload
```json
{
  "email": "user@example.com",
  "password": "secret"
}
```
