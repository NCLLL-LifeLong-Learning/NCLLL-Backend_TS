# NCLLL Backend TypeScript

A comprehensive backend API built with Node.js, TypeScript, Express, and MongoDB for content management system supporting multi-language content (English/Khmer).

## 🚀 Features

### Core Features

- **Multi-language Support**: English and Khmer content management
- **Content Management**: Blog posts, resources, banners, and focus areas
- **User Management**: Admin authentication with role-based access
- **File Upload**: Support for AWS S3, DigitalOcean Spaces, and Local storage
- **Government Structure**: Member hierarchy and position management
- **Partnership Management**: Partner requests and collaboration tracking
- **Website Settings**: Maintenance mode and configuration management

### Technical Features

- **TypeScript**: Full type safety and modern JavaScript features
- **MongoDB**: Document-based database with Mongoose ODM
- **Redis**: Caching and session management
- **Docker**: Containerized deployment
- **Internationalization**: Multi-language error messages and validation
- **File Storage**: Flexible storage options (S3/Spaces/Local)
- **Pagination**: Efficient data pagination with filtering and sorting
- **Validation**: Comprehensive input validation with class-validator

## 🛠️ Tech Stack

- **Runtime**: Node.js 20.18
- **Language**: TypeScript
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis with IORedis
- **Authentication**: JWT tokens
- **Validation**: class-validator, class-transformer
- **File Upload**: Multer with multiple storage backends
- **Logging**: Winston
- **Testing**: Jest
- **Containerization**: Docker

## 📋 Prerequisites

- Node.js 20.18 or higher
- MongoDB 4.4 or higher
- Redis 6.0 or higher
- Yarn package manager

## 🔧 Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/yourusername/nclll-backend.git
   cd nclll-backend
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Environment setup**

   ```bash
   cp .env.example .env
   ```

   Configure your environment variables:

   ```env
   # App Configuration
   APP_PORT=3000
   APP_ENV=local
   APP_TIMEZONE=UTC
   APP_LOCAL_TIMEZONE=Asia/Phnom_Penh

   # JWT Secrets
   JWT_SECRET=your_jwt_secret_here
   JWT_REFRESH_SECRET=your_jwt_refresh_secret_here

   # MongoDB
   MONGO_URI=mongodb://localhost:27017/nclll

   # Redis
   REDIS_HOST=localhost
   REDIS_PORT=6379

   # Storage (choose one)
   USE_STORAGE=LOCAL # or S3 / SPACES
   LOCAL_STORAGE_PATH=./assets
   LOCAL_STORAGE_BASE_URL=http://localhost:3000/assets

   # AWS S3 (if using S3)
   AWS_ACCESS_KEY_ID=your_aws_key
   AWS_SECRET_ACCESS_KEY=your_aws_secret
   AWS_REGION=ap-southeast-2
   AWS_S3_BUCKET_NAME=your_bucket_name

   # DigitalOcean Spaces (if using Spaces)
   DO_SPACES_KEY=your_spaces_key
   DO_SPACES_SECRET=your_spaces_secret
   DO_SPACES_ENDPOINT=nyc3.digitaloceanspaces.com
   DO_SPACES_NAME=your_space_name
   ```

4. **Start development server**
   ```bash
   yarn dev
   ```

## 🐳 Docker Deployment

1. **Using Docker Compose**

   ```bash
   docker-compose up -d
   ```

2. **Build production image**
   ```bash
   docker build -t nclll-backend .
   ```

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

All admin routes require JWT authentication:

```
Authorization: Bearer <your_jwt_token>
```

### API Routes Structure

#### Admin Routes (`/v1/a/`)

- **Auth**: `/auth` - Login, seed admin, profile
- **Content**: `/blog` - Blog post management
- **Resources**: `/resource` - Resource file management
- **Members**: `/member` - Government member management
- **Partners**: `/partner` - Partnership management
- **Settings**: `/settings` - Website configuration
- **Upload**: `/upload` - File upload handling

#### Public Routes (`/v1/u/`)

- **Content**: `/blogs` - Public blog access
- **Resources**: `/resources` - Public resource access
- **Members**: `/govern-members` - Public member directory
- **Partners**: `/partners` - Partner information

### Example API Calls

#### Create Admin Account (Seed)

```bash
curl -X POST http://localhost:3000/v1/a/auth/seed \
  -H "Authorization: Bearer YOUR_SEED_KEY"
```

#### Login

```bash
curl -X POST http://localhost:3000/v1/a/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "password": "1234"
  }'
```

#### Upload File

```bash
curl -X POST http://localhost:3000/v1/a/upload \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -F "file=@/path/to/your/file.jpg"
```

## 🏗️ Project Structure

```
├── app/
│   ├── controller/          # Request handlers
│   │   ├── v1/admin/       # Admin controllers
│   │   └── v1/user/        # Public controllers
│   ├── dto/                # Data transfer objects
│   ├── entity/             # Database models
│   ├── service/            # Business logic
│   └── router/             # Route definitions
├── common/
│   ├── config/             # Configuration files
│   ├── helper/             # Utility helpers
│   ├── middleware/         # Express middleware
│   ├── response/           # Response helpers
│   └── utils/              # Common utilities
├── database/
│   ├── mongodb/            # MongoDB connection
│   └── redis/              # Redis configuration
├── locales/                # Internationalization files
└── global/                 # Global type definitions
```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Role-based Access**: Different permission levels
- **Input Validation**: Comprehensive request validation
- **Rate Limiting**: API rate limiting middleware
- **CORS Protection**: Configurable CORS settings
- **File Upload Security**: File type and size validation

## 🌐 Internationalization

The application supports multiple languages:

- **English** (`en`)
- **Khmer** (`kh`)

Error messages and validation responses are automatically localized based on request headers.

## 📊 Monitoring & Logging

- **Winston Logging**: Structured logging with multiple transports
- **Health Check**: `/health-check` endpoint for monitoring
- **Error Handling**: Centralized error handling with proper HTTP codes

## 🧪 Testing

```bash
# Run tests
yarn test

# Run tests with coverage
yarn test --coverage
```

## 📦 Available Scripts

```bash
# Development
yarn dev          # Start development server with hot reload
yarn build        # Build TypeScript to JavaScript
yarn start        # Start production server

# Database
yarn seed:run     # Run database seeders

# Testing
yarn test         # Run test suite
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 Environment Variables

| Variable      | Description                    | Default                           |
| ------------- | ------------------------------ | --------------------------------- |
| `APP_PORT`    | Server port                    | `3000`                            |
| `APP_ENV`     | Environment                    | `local`                           |
| `MONGO_URI`   | MongoDB connection string      | `mongodb://localhost:27017/nclll` |
| `REDIS_HOST`  | Redis host                     | `localhost`                       |
| `JWT_SECRET`  | JWT signing secret             | Required                          |
| `USE_STORAGE` | Storage type (LOCAL/S3/SPACES) | `LOCAL`                           |

## 🐛 Known Issues

- File upload size limits are configurable but default to 10MB
- Redis connection retry logic may need adjustment for production
- Maintenance mode requires manual key verification

## 📄 License

This project is licensed under the ISC License.

## 👥 Authors

- **Sambo** - Initial work

## 🙏 Acknowledgments

- Express.js community for the robust framework
- MongoDB team for the excellent database
- TypeScript team for type safety
- All contributors who have helped with this project

---

For more information, please contact the development team or open an issue on GitHub.
