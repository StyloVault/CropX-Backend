# Storage API

Base URL: `/storage`

| Method | Endpoint | Description |
| ------ | -------- | ----------- |
| POST | `/upload` | Upload a file to Cloudinary |
| GET | `/:filename` | Retrieve a stored file |

### Example cURL
```bash
curl -F "file=@path/to/image.png" http://localhost:3000/storage/upload
```
