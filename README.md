# OpenWork Agent

<div align="center">

![OpenWork Agent Logo](https://img.shields.io/badge/OpenWork-Agent-blue?style=for-the-badge&logo=code)
![NPM Version](https://img.shields.io/npm/v/openwork-agent?style=for-the-badge&logo=npm)
![License](https://img.shields.io/npm/l/openwork-agent?style=for-the-badge&logo=open-source-initiative)
![Downloads](https://img.shields.io/npm/dt/openwork-agent?style=for-the-badge&logo=npm)

**AI-powered backend code generator for any technology stack**

Create complete backend projects with just a few commands! 🚀

[Install](#-installation) • [Quick Start](#-quick-start) • [Documentation](#-documentation) • [Contributing](#-contributing)

</div>

---

## ✨ Features

- 🌍 **Multiple Technologies**: Node.js, Python, Java, Go, Rust, PHP, and more
- 🎯 **Popular Frameworks**: Express, FastAPI, Spring Boot, Gin, Actix, Laravel, etc.
- 🗄️ **Database Support**: MongoDB, PostgreSQL, MySQL, SQLite, Redis
- 🐳 **Docker Support**: Automatic Dockerfile and docker-compose generation
- 🚀 **CI/CD Ready**: GitHub Actions workflow generation
- 💬 **Interactive Mode**: Guided project setup with prompts
- 📋 **Template System**: Customizable templates for any stack
- 🔍 **Technology Detection**: Analyze existing projects
- 🛡️ **Best Practices**: Security, logging, error handling, CORS

## 📦 Installation

### Global Installation (Recommended)

```bash
npm install -g openwork-agent
```

### Local Installation

```bash
npm install openwork-agent
```

### Using Yarn

```bash
yarn global add openwork-agent
```

### Using pnpm

```bash
pnpm add -g openwork-agent
```

## 🚀 Quick Start

### 1. Create a New Project (Interactive Mode)

```bash
openwork-agent create my-awesome-api
```

### 2. Create with Specific Technology

```bash
openwork-agent create my-fastapi-app --tech python --framework fastapi --database postgresql
```

### 3. Create with Docker and Tests

```bash
openwork-agent create my-enterprise-app --tech node --framework express --database mongodb --docker --tests
```

### 4. List Available Templates

```bash
openwork-agent templates
```

### 5. Analyze Existing Project

```bash
cd existing-project
openwork-agent analyze
```

## 📋 Supported Technologies

### JavaScript/Node.js
- **Frameworks**: Express.js, NestJS, Fastify, Koa, Hapi
- **Databases**: MongoDB (Mongoose), PostgreSQL, MySQL, SQLite
- **Features**: TypeScript, JWT auth, validation, testing

### Python
- **Frameworks**: FastAPI, Django, Flask, Tornado, AioHTTP
- **Databases**: MongoDB (Motor), PostgreSQL (asyncpg), MySQL, SQLite
- **Features**: Pydantic validation, async/await, Swagger docs

### Java
- **Frameworks**: Spring Boot, Quarkus, Micronaut, Vert.x
- **Databases**: MongoDB, PostgreSQL, MySQL, Oracle
- **Features**: Spring Data, REST controllers, JPA, testing

### Go
- **Frameworks**: Gin, Echo, Fiber, Chi, Gorilla Mux
- **Databases**: MongoDB, PostgreSQL, MySQL, SQLite
- **Features**: Structured logging, middleware, validation

### Rust
- **Frameworks**: Actix-web, Rocket, Warp, Axum
- **Databases**: PostgreSQL, SQLite
- **Features**: Diesel ORM, async, error handling

### PHP
- **Frameworks**: Laravel, Symfony, Slim
- **Databases**: MySQL, PostgreSQL, SQLite
- **Features**: Eloquent ORM, middleware, routing

## 📖 Usage Examples

### Node.js with Express and MongoDB

```bash
openwork-agent create blog-api --tech node --framework express --database mongodb --docker
```

**Generated:**
- Express.js server with TypeScript
- MongoDB integration with Mongoose
- User CRUD operations
- Docker setup
- JWT authentication
- Error handling middleware

### Python FastAPI with PostgreSQL

```bash
openwork-agent create data-api --tech python --framework fastapi --database postgresql --tests
```

**Generated:**
- FastAPI application
- PostgreSQL integration
- Pydantic models
- Async database operations
- API documentation (Swagger)
- Unit tests with pytest

### Java Spring Boot Microservice

```bash
openwork-agent create user-service --tech java --framework spring --database mysql --ci
```

**Generated:**
- Spring Boot application
- MySQL integration with JPA
- REST controllers
- Service layer
- Unit tests with JUnit
- GitHub Actions workflow

### Go Gin Web Service

```bash
openwork-agent create go-api --tech go --framework gin --database postgresql --docker
```

**Generated:**
- Gin web framework setup
- PostgreSQL with GORM
- Structured logging
- Configuration management
- Docker multi-stage build

## 🗂️ Project Structure

Generated projects follow best practices:

```
my-project/
├── src/                    # Source code
│   ├── controllers/        # Route controllers
│   ├── models/            # Data models
│   ├── routes/            # API routes
│   ├── middleware/        # Middleware
│   ├── services/          # Business logic
│   ├── utils/             # Utilities
│   └── config/            # Configuration
├── tests/                 # Test files
├── docs/                  # Documentation
├── Dockerfile            # Docker configuration
├── docker-compose.yml    # Development environment
├── .github/workflows/     # CI/CD workflows
├── package.json         # Dependencies
├── .env.example          # Environment template
└── README.md            # Project documentation
```

## 🔧 Configuration

### CLI Options

```bash
Options:
  -t, --tech <technology>      Specify technology (node, python, java, go, rust, php)
  -d, --database <database>    Specify database (mongodb, postgresql, mysql, sqlite, redis)
  -f, --framework <framework>  Specify framework (express, fastapi, spring, gin, etc.)
  --template <template>        Use specific template
  --no-interactive            Skip interactive prompts
  --docker                     Include Docker configuration
  --tests                      Include test setup
  --ci                         Include CI/CD configuration
```

### Environment Variables

```bash
# Server
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL=mongodb://localhost:27017/myapp
DB_NAME=myapp

# Security
JWT_SECRET=your-secret-key
CORS_ORIGINS=http://localhost:3000

# Logging
LOG_LEVEL=info
```

## 📡 API Endpoints

Every generated project includes these standard endpoints:

### Health Check
```http
GET /health
```

### User Management
```http
GET    /api/users        # Get all users
GET    /api/users/:id    # Get user by ID
POST   /api/users        # Create new user
PUT    /api/users/:id    # Update user
DELETE /api/users/:id    # Delete user
```

## 🐳 Docker Support

Generated projects include:

### Multi-stage Dockerfile
Optimized for production builds with security best practices.

### Docker Compose
Complete development environment with database and services.

### Example docker-compose.yml
```yaml
version: '3.8'
services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
      - mongodb
    environment:
      - DATABASE_URL=mongodb://mongodb:27017/myapp
  
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db

volumes:
  mongodb_data:
```

## 🧪 Testing

Generated projects include comprehensive test setups:

### Node.js
```bash
npm test                    # Run tests
npm run test:watch         # Watch mode
npm run test:coverage      # Coverage report
```

### Python
```bash
pytest                     # Run tests
pytest --cov              # Coverage report
pytest -v                 # Verbose output
```

### Java
```bash
mvn test                   # Run tests
mvn verify                 # Run with integration tests
```

### Go
```bash
go test ./...              # Run all tests
go test -v ./...          # Verbose output
go test -cover ./...      # Coverage report
```

### Rust
```bash
cargo test                 # Run tests
cargo test -- --nocapture # Verbose output
```

## 🔒 Security Features

- **Input Validation**: Comprehensive validation using appropriate libraries
- **SQL Injection Prevention**: ORM usage with parameterized queries
- **XSS Protection**: Content Security Policy and input sanitization
- **CORS Configuration**: Proper CORS setup for APIs
- **Security Headers**: Helmet.js (Node.js) or equivalent
- **JWT Authentication**: Secure token-based authentication
- **Rate Limiting**: Built-in rate limiting support

## 📈 Performance Features

- **Connection Pooling**: Database connection management
- **Caching**: Redis integration support
- **Async Operations**: Full async/await support where applicable
- **Compression**: Gzip/Brotli compression
- **Error Handling**: Comprehensive error handling and logging
- **Health Checks**: Application health monitoring

## 🚀 Deployment

### Heroku
```bash
heroku create your-app-name
git push heroku main
```

### Vercel
```bash
npm i -g vercel
vercel --prod
```

### Railway
```bash
railway login
railway init
railway up
```

### AWS
```bash
# Using Docker
docker build -t my-app .
docker run -p 3000:3000 my-app
```

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Setup

```bash
git clone https://github.com/openwork-agent/openwork-agent.git
cd openwork-agent
npm install
npm test
npm link
```

### Adding New Templates

1. Create template files in `src/templates/{technology}/`
2. Add framework support in `TechDetector.js`
3. Update configuration in generators
4. Add tests and documentation

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- Built with ❤️ for the developer community
- Thanks to all the amazing open-source projects
- Inspired by the need for rapid backend development

## 📞 Support

- 📧 Email: [manoj.sharma@example.com](mailto:manoj.sharma@example.com)
- 💼 LinkedIn: [Manoj Sharma](https://linkedin.com/in/manoj-sharma)
- 🐛 Issues: [GitHub Issues](https://github.com/manoj1234-ms/openwork-agent/issues)
- 📖 Documentation: [GitHub README](https://github.com/manoj1234-ms/openwork-agent#readme)

## 🗺️ Roadmap

- [ ] GraphQL template support
- [ ] Frontend template generation
- [ ] Microservice templates
- [ ] Real-time features (WebSocket)
- [ ] Advanced authentication patterns
- [ ] Monitoring and observability
- [ ] Cloud deployment templates
- [ ] Template marketplace

---

<div align="center">

**⭐ Star this repo if it helped you!**

Built with ❤️ by [Manoj Sharma](https://github.com/manoj1234-ms)

[![GitHub stars](https://img.shields.io/github/stars/openwork-agent/openwork-agent?style=social)](https://github.com/openwork-agent/openwork-agent)
[![GitHub forks](https://img.shields.io/github/forks/openwork-agent/openwork-agent?style=social)](https://github.com/openwork-agent/openwork-agent)
[![GitHub issues](https://img.shields.io/github/issues/openwork-agent/openwork-agent)](https://github.com/openwork-agent/openwork-agent/issues)

</div>