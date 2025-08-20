# CropX Backend

Backend infrastructure for CropXchange — a farm inventory and management platform for African farmers.

## 🌾 Core Features

- Multi-farm inventory management
- Track crop yield, fertilizer use, and expenses
- Farmer profile & authentication
- Scalable RESTful API
- Built with NestJS, MongoDB, Redis, Docker

## 🧰 Tech Stack

- **NestJS**
- **MongoDB**
- **Redis** (for caching)
- **Docker**
- **JWT Auth**
- **Mongoose**
- **Swagger/OpenAPI**

## 🚀 How to Run Locally

```bash
# Clone repo
git clone https://github.com/StyloVault/CropX-Backend.git

# Install dependencies
npm install

# Setup .env (see .env.example)

# Run locally
npm run start:dev
```

### Environment Variables

`DAILY_NEWS_LINKS` - JSON array of news links used for daily AI summaries.

## API Endpoints

- `POST /api/v1/inventory/create` - Create a new inventory item
- `PATCH /api/v1/inventory/update/:id` - Update an existing inventory item

## Documentation

Detailed API documentation is available in the [doc](doc/) directory. Import `doc/CropX.postman_collection.json` in Postman to try the endpoints.
