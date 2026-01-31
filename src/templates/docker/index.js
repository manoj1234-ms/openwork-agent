// Docker template generation methods
const generateDockerTemplates = {
  node: function(config) {
    return `# Stage 1: Build
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm ci --only=production

# Copy source code
COPY . .

# Build the application
${config.framework === 'typescript' || config.framework === 'nestjs' ? 'RUN npm run build' : ''}

# Stage 2: Production
FROM node:18-alpine AS production

WORKDIR /app

# Copy built application and dependencies
${config.framework === 'typescript' || config.framework === 'nestjs' ? 'COPY --from=builder /app/dist ./dist' : 'COPY --from=builder /app/src ./src'}
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nextjs -u 1001

USER nextjs

EXPOSE 3000

ENV NODE_ENV=production
ENV PORT=3000

CMD ["npm", "start"]`;
  },

  python: function(config) {
    return `FROM python:3.11-slim

WORKDIR /app

# Install system dependencies
RUN apt-get update && apt-get install -y \\
    gcc \\
    && rm -rf /var/lib/apt/lists/*

# Copy requirements and install Python dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy application code
COPY . .

# Create non-root user
RUN useradd --create-home --shell /bin/bash app \\
    && chown -R app:app /app
USER app

EXPOSE 8000

ENV PYTHONPATH=/app
ENV PYTHONUNBUFFERED=1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`;
  },

  java: function(config) {
    return `FROM maven:3.9-openjdk-17 AS builder

WORKDIR /app

# Copy pom.xml and download dependencies
COPY pom.xml .
RUN mvn dependency:go-offline

# Copy source code
COPY src ./src

# Build the application
RUN mvn clean package -DskipTests

# Production stage
FROM openjdk:17-jre-slim

WORKDIR /app

# Copy the built JAR file
COPY --from=builder /app/target/*.jar app.jar

# Create non-root user
RUN groupadd -r spring && useradd -r -g spring spring
USER spring

EXPOSE 8080

ENV JAVA_OPTS="-Xmx512m -Xms256m"

CMD ["java", "-jar", "app.jar"]`;
  },

  go: function(config) {
    return `FROM golang:1.21-alpine AS builder

WORKDIR /app

# Copy go mod files
COPY go.mod go.sum ./

# Download dependencies
RUN go mod download

# Copy source code
COPY . .

# Build the application
RUN CGO_ENABLED=0 GOOS=linux go build -a -installsuffix cgo -o main .

# Production stage
FROM alpine:latest

RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/

# Copy the binary from builder stage
COPY --from=builder /app/main .

# Expose port
EXPOSE 8080

CMD ["./main"]`;
  },

  rust: function(config) {
    return `FROM rust:1.70 as builder

WORKDIR /app

# Copy Cargo files
COPY Cargo.toml Cargo.lock ./

# Create dummy main.rs to cache dependencies
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release && rm -rf src

# Copy source code
COPY src ./src

# Build the application
RUN touch src/main.rs && cargo build --release

# Production stage
FROM debian:bookworm-slim

# Install runtime dependencies
RUN apt-get update && apt-get install -y \\
    ca-certificates \\
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the binary from builder stage
COPY --from=builder /app/target/release/${config.projectName} .

# Create non-root user
RUN useradd -r -s /bin/false rustuser
USER rustuser

EXPOSE 8080

CMD ["./${config.projectName}"]`;
  },

  php: function(config) {
    return `FROM php:8.2-fpm-alpine

# Install system dependencies
RUN apk add --no-cache \\
    git \\
    curl \\
    libpng-dev \\
    oniguruma-dev \\
    libxml2-dev \\
    zip \\
    unzip \\
    && docker-php-ext-install pdo_mysql mbstring exif pcntl bcmath gd

# Get latest Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Set working directory
WORKDIR /var/www

# Copy application files
COPY . .

# Install PHP dependencies
RUN composer install --no-interaction --no-plugins --no-scripts --prefer-dist

# Set permissions
RUN chown -R www-data:www-data /var/www
RUN chmod -R 755 /var/www/storage

EXPOSE 9000

CMD ["php-fpm"]`;
  }
};

// Docker Compose generation
function generateDockerCompose(config) {
  const services = {
    api: {
      build: {
        context: '.',
        dockerfile: 'Dockerfile'
      },
      ports: ['3000:3000'],
      environment: [
        'NODE_ENV=production'
      ],
      depends_on: config.database ? [config.database] : undefined,
      restart: 'unless-stopped'
    }
  };

  // Add database service if selected
  if (config.database) {
    const dbServices = {
      mongodb: {
        image: 'mongo:7.0',
        ports: ['27017:27017'],
        environment: [
          'MONGO_INITDB_ROOT_USERNAME=admin',
          'MONGO_INITDB_ROOT_PASSWORD=password',
          `MONGO_INITDB_DATABASE=${config.projectName}`
        ],
        volumes: ['mongodb_data:/data/db'],
        restart: 'unless-stopped'
      },
      postgresql: {
        image: 'postgres:15',
        ports: ['5432:5432'],
        environment: [
          'POSTGRES_DB=postgres',
          'POSTGRES_USER=postgres',
          'POSTGRES_PASSWORD=password'
        ],
        volumes: ['postgres_data:/var/lib/postgresql/data'],
        restart: 'unless-stopped'
      },
      mysql: {
        image: 'mysql:8.0',
        ports: ['3306:3306'],
        environment: [
          `MYSQL_DATABASE=${config.projectName}`,
          'MYSQL_ROOT_PASSWORD=password',
          'MYSQL_USER=user',
          'MYSQL_PASSWORD=password'
        ],
        volumes: ['mysql_data:/var/lib/mysql'],
        restart: 'unless-stopped'
      },
      redis: {
        image: 'redis:7.0-alpine',
        ports: ['6379:6379'],
        volumes: ['redis_data:/data'],
        restart: 'unless-stopped'
      }
    };

    if (dbServices[config.database]) {
      services[config.database] = dbServices[config.database];
    }
  }

  const dockerCompose = {
    version: '3.8',
    services,
    volumes: {}
  };

  // Add volume definitions
  if (config.database && ['mongodb', 'postgresql', 'mysql', 'redis'].includes(config.database)) {
    dockerCompose.volumes[`${config.database}_data`] = {};
  }

  return `version: '3.8'

services:
${Object.entries(services).map(([name, service]) => {
  let serviceYaml = `  ${name}:\n`;
  
  if (service.build) {
    serviceYaml += `    build:\n`;
    Object.entries(service.build).forEach(([key, value]) => {
      serviceYaml += `      ${key}: ${typeof value === 'string' ? value : ''}\n`;
    });
  }
  
  if (service.image) {
    serviceYaml += `    image: ${service.image}\n`;
  }
  
  if (service.ports) {
    serviceYaml += `    ports:\n`;
    service.ports.forEach(port => {
      serviceYaml += `      - "${port}"\n`;
    });
  }
  
  if (service.environment) {
    serviceYaml += `    environment:\n`;
    service.environment.forEach(env => {
      serviceYaml += `      - ${env}\n`;
    });
  }
  
  if (service.depends_on) {
    serviceYaml += `    depends_on:\n`;
    service.depends_on.forEach(dep => {
      serviceYaml += `      - ${dep}\n`;
    });
  }
  
  if (service.volumes) {
    serviceYaml += `    volumes:\n`;
    service.volumes.forEach(vol => {
      serviceYaml += `      - ${vol}\n`;
    });
  }
  
  if (service.restart) {
    serviceYaml += `    restart: ${service.restart}\n`;
  }
  
  return serviceYaml;
}).join('')}
${Object.keys(dockerCompose.volumes).length > 0 ? `
volumes:
${Object.keys(dockerCompose.volumes).map(vol => `  ${vol}:`).join('\n')}` : ''}`;
}

// Dockerignore generation
function generateDockerignore(config) {
  const commonIgnore = `
# Dependencies
node_modules/
__pycache__/
target/
build/
dist/
vendor/

# Environment variables
.env
.env.local
.env.*.local

# Logs
logs
*.log
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Git
.git
.gitignore

# Documentation
README.md
docs/

# Test files
test/
tests/
*.test.js
*.spec.js
`;

  return commonIgnore;
}

// CI/CD templates
function generateGitHubActions(config) {
  return `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      ${config.database ? `${config.database}:
        image: ${getDatabaseImage(config.database)}
        ports:
          - ${getDatabasePort(config.database)}:${getDatabasePort(config.database)}
        env:
          ${getDatabaseEnv(config.database)}` : ''}

    steps:
    - uses: actions/checkout@v3
    
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
    
    - name: Install dependencies
      run: npm ci
    
    - name: Run tests
      run: npm test
      env:
        ${config.database ? getTestEnv(config) : ''}
    
    - name: Build application
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - uses: actions/checkout@v3
    
    - name: Deploy to production
      run: |
        echo "Deploy to production"
        # Add your deployment commands here
`;
}

function getDatabaseImage(database) {
  const images = {
    mongodb: 'mongo:7.0',
    postgresql: 'postgres:15',
    mysql: 'mysql:8.0',
    redis: 'redis:7.0'
  };
  return images[database] || '';
}

function getDatabasePort(database) {
  const ports = {
    mongodb: '27017',
    postgresql: '5432',
    mysql: '3306',
    redis: '6379'
  };
  return ports[database] || '';
}

function getDatabaseEnv(database) {
  const envs = {
    mongodb: 'MONGO_INITDB_ROOT_USERNAME: admin\n          MONGO_INITDB_ROOT_PASSWORD: password',
    postgresql: 'POSTGRES_PASSWORD: password\n          POSTGRES_USER: postgres',
    mysql: 'MYSQL_ROOT_PASSWORD: password\n          MYSQL_DATABASE: test'
  };
  return envs[database] || '';
}

function getTestEnv(config) {
  const envs = {
    mongodb: `MONGODB_URI: mongodb://admin:password@localhost:${getDatabasePort(config.database)}/test`,
    postgresql: `DATABASE_URL: postgresql://postgres:password@localhost:${getDatabasePort(config.database)}/test`,
    mysql: `DATABASE_URL: mysql://root:password@localhost:${getDatabasePort(config.database)}/test`
  };
  return envs[config.database] || '';
}

module.exports = {
  generateDockerfileNode: generateDockerTemplates.node,
  generateDockerfilePython: generateDockerTemplates.python,
  generateDockerfileJava: generateDockerTemplates.java,
  generateDockerfileGo: generateDockerTemplates.go,
  generateDockerfileRust: generateDockerTemplates.rust,
  generateDockerfilePhp: generateDockerTemplates.php,
  generateDockerCompose,
  generateDockerignore,
  generateGitHubActions
};