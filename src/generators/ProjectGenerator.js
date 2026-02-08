const inquirer = require('inquirer').default;
const chalk = require('chalk');
const ora = require('ora');
const fs = require('fs-extra');
const path = require('path');

const FileManager = require('../utils/FileManager');
const TechDetector = require('../core/TechDetector');

class ProjectGenerator {
  constructor() {
    this.fileManager = new FileManager();
    this.techDetector = new TechDetector();
    this.templatesPath = path.join(__dirname, '../templates');
  }

  async promptForConfiguration(config) {
    const questions = [];

    // Technology selection
    if (!config.technology) {
      const technologies = this.techDetector.getAvailableTechnologies();
      const recommended = this.techDetector.getRecommendedTechStack();
      
      questions.push({
        type: 'list',
        name: 'technology',
        message: 'Choose your technology stack:',
        choices: [
          ...technologies.map(tech => ({
            name: `${tech.toUpperCase()} - ${recommended[tech]?.reason || 'Popular backend technology'}`,
            value: tech
          })),
          { name: '──────────────', disabled: true }
        ]
      });
    }

    // Framework selection (after technology is known)
    const tech = config.technology || (await inquirer.prompt([{
      type: 'list',
      name: 'technology',
      message: 'Choose your technology stack:',
      choices: this.techDetector.getAvailableTechnologies()
    }])).technology;

    const frameworks = this.techDetector.getFrameworksForTechnology(tech);
    if (frameworks.length > 0 && !config.framework) {
      questions.push({
        type: 'list',
        name: 'framework',
        message: `Choose ${tech} framework:`,
        choices: [
          ...frameworks.map(fw => fw.toUpperCase()),
          { name: 'None/Custom', value: null }
        ]
      });
    }

    // Database selection
    if (!config.database) {
      const databases = this.techDetector.getAvailableDatabases();
      questions.push({
        type: 'list',
        name: 'database',
        message: 'Choose your database:',
        choices: [
          ...databases.map(db => db.toUpperCase()),
          { name: 'None/No database', value: null }
        ]
      });
    }

    // Additional options
    if (!config.template) {
      questions.push({
        type: 'list',
        name: 'template',
        message: 'Choose project template:',
        choices: [
          { name: 'Basic REST API', value: 'api' },
          { name: 'Full CRUD App', value: 'crud' },
          { name: 'Microservice', value: 'microservice' },
          { name: 'GraphQL API', value: 'graphql' },
          { name: 'Minimal', value: 'minimal' }
        ]
      });
    }

    questions.push(
      {
        type: 'confirm',
        name: 'includeDocker',
        message: 'Include Docker configuration?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeTests',
        message: 'Include test setup?',
        default: true
      },
      {
        type: 'confirm',
        name: 'includeCI',
        message: 'Include CI/CD configuration?',
        default: false
      },
      {
        type: 'input',
        name: 'author',
        message: 'Author name:',
        default: 'OpenWork Agent'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Project description:',
        default: `${config.projectName} - Backend application`
      }
    );

    const answers = await inquirer.prompt(questions);
    return { ...config, ...answers };
  }

  async createProject(config) {
    const spinner = ora('Creating project...').start();

    try {
      const projectPath = path.resolve(process.cwd(), config.projectName);

      // Check if directory already exists
      if (await fs.pathExists(projectPath)) {
        throw new Error(`Directory ${config.projectName} already exists`);
      }

      // Create project directory
      await fs.ensureDir(projectPath);
      spinner.text = 'Setting up project structure...';

      // Generate project structure
      await this.generateProjectStructure(projectPath, config);
      
      // Copy template files
      await this.copyTemplateFiles(projectPath, config);
      
      // Generate configuration files
      await this.generateConfiguration(projectPath, config);
      
      // Generate Docker files if requested
      if (config.includeDocker) {
        await this.generateDockerFiles(projectPath, config);
      }
      
      // Generate CI/CD if requested
      if (config.includeCI) {
        await this.generateCIFiles(projectPath, config);
      }

      spinner.succeed(`Project ${config.projectName} created successfully!`);

      // Show next steps
      this.showNextSteps(config);

    } catch (error) {
      spinner.fail('Failed to create project');
      throw error;
    }
  }

  async generateProjectStructure(projectPath, config) {
    const structure = this.getProjectStructure(config);
    
    for (const dir of structure.directories) {
      await fs.ensureDir(path.join(projectPath, dir));
    }

    // Create basic files
    for (const [filename, content] of Object.entries(structure.files || {})) {
      await fs.writeFile(
        path.join(projectPath, filename),
        typeof content === 'function' ? content(config) : content
      );
    }
  }

  getProjectStructure(config) {
    const baseStructure = {
      directories: [
        'src',
        'src/controllers',
        'src/models',
        'src/routes',
        'src/middleware',
        'src/services',
        'src/utils',
        'src/config',
        'tests',
        'docs'
      ],
      files: {
        '.gitignore': this.generateGitignore(config),
        'README.md': () => this.generateReadme(config)
      }
    };

    // Add technology-specific structure
    const techStructure = this.getTechnologySpecificStructure(config);
    
    return {
      directories: [...baseStructure.directories, ...techStructure.directories],
      files: { ...baseStructure.files, ...techStructure.files }
    };
  }

  getTechnologySpecificStructure(config) {
    const structures = {
      node: {
        directories: ['src/types', 'src/interfaces', 'src/dto'],
        files: {
          'package.json': () => this.generatePackageJSON(config),
          'tsconfig.json': () => this.generateTsConfig(config),
          '.env.example': this.generateEnvExample(config)
        }
      },
      python: {
        directories: ['src/api', 'src/db', 'migrations'],
        files: {
          'requirements.txt': () => this.generateRequirements(config),
          'setup.py': () => this.generateSetupPy(config),
          '.env.example': this.generateEnvExample(config)
        }
      },
      java: {
        directories: ['src/main/java', 'src/main/resources', 'src/test/java'],
        files: {
          'pom.xml': () => this.generatePomXML(config),
          'src/main/resources/application.properties': () => this.generateApplicationProperties(config)
        }
      },
      go: {
        directories: ['internal', 'pkg', 'cmd', 'api'],
        files: {
          'go.mod': () => this.generateGoMod(config),
          'main.go': () => this.generateMainGo(config)
        }
      },
      rust: {
        directories: ['src/bin', 'tests'],
        files: {
          'Cargo.toml': () => this.generateCargoToml(config),
          'src/main.rs': () => this.generateMainRs(config)
        }
      },
      php: {
        directories: ['app/Http/Controllers', 'app/Models', 'database/migrations', 'routes'],
        files: {
          'composer.json': () => this.generateComposerJSON(config),
          '.env.example': this.generateEnvExample(config)
        }
      }
    };

    return structures[config.technology] || { directories: [], files: {} };
  }

  async copyTemplateFiles(projectPath, config) {
    const templatePath = path.join(this.templatesPath, config.technology);
    
    if (!await fs.pathExists(templatePath)) {
      console.log(chalk.yellow(`Warning: No templates found for ${config.technology}`));
      return;
    }

    const frameworkPath = config.framework ? 
      path.join(templatePath, config.framework) : 
      path.join(templatePath, 'basic');

    if (await fs.pathExists(frameworkPath)) {
      await this.fileManager.copyDirectory(frameworkPath, projectPath, config);
    }
  }

  async generateConfiguration(projectPath, config) {
    // Generate config files
    const configPath = path.join(projectPath, 'src/config');
    
    switch (config.technology) {
      case 'node':
        await this.generateNodeConfig(configPath, config);
        break;
      case 'python':
        await this.generatePythonConfig(configPath, config);
        break;
      case 'java':
        await this.generateJavaConfig(projectPath, config);
        break;
      case 'go':
        await this.generateGoConfig(projectPath, config);
        break;
      case 'rust':
        await this.generateRustConfig(projectPath, config);
        break;
      case 'php':
        await this.generatePhpConfig(projectPath, config);
        break;
    }
  }

  async generateDockerFiles(projectPath, config) {
    const dockerConfigs = {
      node: this.generateDockerfileNode,
      python: this.generateDockerfilePython,
      java: this.generateDockerfileJava,
      go: this.generateDockerfileGo,
      rust: this.generateDockerfileRust,
      php: this.generateDockerfilePhp
    };

    const dockerfile = dockerConfigs[config.technology];
    if (dockerfile) {
      await fs.writeFile(
        path.join(projectPath, 'Dockerfile'),
        dockerfile.call(this, config)
      );
    }

    // Generate docker-compose.yml if database is selected
    if (config.database) {
      await fs.writeFile(
        path.join(projectPath, 'docker-compose.yml'),
        this.generateDockerCompose(config)
      );
    }

    // Generate .dockerignore
    await fs.writeFile(
      path.join(projectPath, '.dockerignore'),
      this.generateDockerignore(config)
    );
  }

  getSetupCommands(technology) {
    const commands = {
      node: ['npm install', 'npm run dev'],
      python: ['python -m venv venv', 'source venv/bin/activate', 'pip install -r requirements.txt', 'uvicorn main:app --reload'],
      java: ['mvn clean install', 'mvn spring-boot:run'],
      go: ['go mod download', 'go run main.go'],
      rust: ['cargo build', 'cargo run'],
      php: ['composer install', 'php artisan serve']
    };

    return commands[technology] || ['echo "Setup commands not defined for this technology"'];
  }

  showNextSteps(config) {
    console.log(chalk.cyan('\n📋 Next Steps:'));
    console.log(chalk.white(`  cd ${config.projectName}`));
    
    this.getSetupCommands(config.technology).forEach(cmd => {
      console.log(chalk.white(`  ${cmd}`));
    });

    if (config.includeDocker) {
      console.log(chalk.white('  docker-compose up'));
    }

    console.log(chalk.green('\n✨ Happy coding!'));
  }

  // Template generation methods
  generatePackageJSON(config) {
    return JSON.stringify({
      name: config.projectName,
      version: '1.0.0',
      description: config.description,
      main: 'dist/index.js',
      scripts: {
        dev: 'nodemon src/index.ts',
        build: 'tsc',
        start: 'node dist/index.js',
        test: 'jest',
        'test:watch': 'jest --watch'
      },
      dependencies: this.getNodeDependencies(config),
      devDependencies: this.getNodeDevDependencies(config),
      author: config.author,
      license: 'MIT'
    }, null, 2);
  }

  getNodeDependencies(config) {
    const deps = {
      express: ['express', 'cors', 'helmet'],
      nestjs: ['@nestjs/core', '@nestjs/common', '@nestjs/platform-express'],
      fastify: ['fastify', '@fastify/cors']
    };

    const dbDeps = {
      mongodb: ['mongoose'],
      postgresql: ['pg', 'typeorm'],
      mysql: ['mysql2', 'typeorm'],
      sqlite: ['sqlite3', 'typeorm']
    };

    const frameworkDeps = deps[config.framework] || deps.express;
    const databaseDeps = config.database ? dbDeps[config.database] : [];

    return [...new Set([...frameworkDeps, ...databaseDeps, 'dotenv'])];
  }

  getNodeDevDependencies(config) {
    return [
      '@types/node',
      'typescript',
      'ts-node',
      'nodemon',
      'jest',
      '@types/jest',
      'ts-jest'
    ];
  }

  generateTsConfig(config) {
    return JSON.stringify({
      compilerOptions: {
        target: 'ES2020',
        module: 'commonjs',
        lib: ['ES2020'],
        outDir: './dist',
        rootDir: './src',
        strict: true,
        esModuleInterop: true,
        skipLibCheck: true,
        forceConsistentCasingInFileNames: true,
        resolveJsonModule: true,
        declaration: true,
        declarationMap: true,
        sourceMap: true
      },
      include: ['src/**/*'],
      exclude: ['node_modules', 'dist', 'tests']
    }, null, 2);
  }

  generateGitignore(config) {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Build output
dist/
build/

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# IDE files
.vscode/
.idea/
*.swp
*.swo

# OS files
.DS_Store
Thumbs.db

# Logs
logs/
*.log

# Coverage reports
coverage/
.nyc_output/

# Database
*.db
*.sqlite

# Temporary files
tmp/
temp/`;
  }

  generateEnvExample(config) {
    return `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DATABASE_URL=
DB_NAME=

# Security
JWT_SECRET=your-secret-key-here
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# Logging
LOG_LEVEL=info

# External Services
# API_KEY=
# WEBHOOK_URL=`;
  }

  generateCargoToml(config) {
    return `[package]
name = "${config.projectName}"
version = "0.1.0"
edition = "2021"
authors = ["${config.author || 'OpenWork Agent'}"]
description = "${config.description || 'Rust backend application'}"

[dependencies]
tokio = { version = "1.0", features = ["full"] }
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
actix-web = "4.0"
actix-cors = "0.6"
dotenv = "0.15"
env_logger = "0.10"
log = "0.4"

[dev-dependencies]
tokio-test = "0.4"
`;
  }

  generateGoMod(config) {
    return `module ${config.projectName}

go 1.21

require (
	github.com/gin-gonic/gin v1.9.1
	github.com/joho/godotenv v1.4.0
	github.com/gin-contrib/cors v1.4.0
	gorm.io/gorm v1.25.4
	gorm.io/driver/postgres v1.5.2
)`;
  }

  generateReadme(config) {
    return `# ${config.projectName}

${config.description || 'Backend application'}

## Getting Started

### Prerequisites
- Node.js 14+
- npm or yarn

### Installation

\`\`\`bash
npm install
\`\`\`

### Development

\`\`\`bash
npm run dev
\`\`\`

### Build

\`\`\`bash
npm run build
\`\`\`

### Test

\`\`\`bash
npm test
\`\`\`

## API Documentation

Visit \`http://localhost:3000/api-docs\` for API documentation.

## License

MIT
`;
  }

  // Additional methods for completeness
  generateRequirements(config) {
    const requirements = [
      'fastapi==0.104.1',
      'uvicorn[standard]==0.24.0',
      'pydantic==2.5.0',
      'python-dotenv==1.0.0'
    ];

    if (config.database === 'postgresql') {
      requirements.push('asyncpg==0.29.0', 'sqlalchemy==2.0.23');
    } else if (config.database === 'mongodb') {
      requirements.push('motor==3.3.2', 'pymongo==4.6.0');
    }

    return requirements.join('\n');
  }

  generateSetupPy(config) {
    return `from setuptools import setup, find_packages

setup(
    name="${config.projectName}",
    version="1.0.0",
    description="${config.description || 'Python backend application'}",
    author="${config.author || 'OpenWork Agent'}",
    packages=find_packages(),
    install_requires=open('requirements.txt').read().splitlines(),
    python_requires=">=3.8",
)`;
  }

  generatePomXML(config) {
    return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.openwork</groupId>
    <artifactId>${config.projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>${config.projectName}</name>
    <description>${config.description || 'Java backend application'}</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.1.5</version>
    </parent>

    <properties>
        <java.version>17</java.version>
    </properties>

    <dependencies>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-data-jpa</artifactId>
        </dependency>
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>

    <build>
        <plugins>
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
            </plugin>
        </plugins>
    </build>
</project>`;
  }

  generateApplicationProperties(config) {
    return `# Server Configuration
server.port=8080
server.servlet.context-path=/

# Database Configuration
spring.datasource.url=jdbc:postgresql://localhost:5432/${config.projectName}
spring.datasource.username=postgres
spring.datasource.password=password
spring.datasource.driver-class-name=org.postgresql.Driver

# JPA Configuration
spring.jpa.hibernate.ddl-auto=update
spring.jpa.show-sql=true
spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.PostgreSQLDialect

# Logging
logging.level.com.openwork=INFO
logging.level.org.springframework.web=WARN`;
  }

  generateComposerJSON(config) {
    return JSON.stringify({
      name: config.projectName,
      description: config.description || 'PHP backend application',
      type: 'project',
      require: {
        php: '^8.1',
        'laravel/framework': '^10.0'
      },
      requireDev: {
        'phpunit/phpunit': '^10.0'
      },
      autoload: {
        psr4: {
          'App\\\\': 'app/'
        }
      },
      authors: [
        {
          name: config.author || 'OpenWork Agent'
        }
      ],
      minimumStability: 'stable',
      preferStable: true
    }, null, 2);
  }

  generateMainGo(config) {
    return `package main

import (
    "log"
    "net/http"
    "github.com/gin-gonic/gin"
    "github.com/gin-contrib/cors"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("No .env file found")
    }

    // Initialize Gin router
    r := gin.Default()

    // Configure CORS
    r.Use(cors.Default())

    // Health check endpoint
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "ok",
            "service": "${config.projectName}",
        })
    })

    // Start server
    log.Println("Server starting on :8080")
    if err := r.Run(":8080"); err != nil {
        log.Fatal("Failed to start server:", err)
    }
}`;
  }

  generateMainRs(config) {
    return `use actix_web::{get, App, HttpServer, Responder, HttpResponse};
use std::env;

#[get("/health")]
async fn health() -> impl Responder {
    HttpResponse::Ok().json(serde_json::json!({
        "status": "ok",
        "service": "${config.projectName}"
    }))
}

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    // Load environment variables
    dotenv::dotenv().ok();

    let port = env::var("PORT").unwrap_or_else(|_| "8080".to_string());
    let bind_address = format!("0.0.0.0:{}", port);

    HttpServer::new(|| {
        App::new()
            .service(health)
    })
    .bind(&bind_address)?
    .run()
    .await
}`;
  }

  // Docker generation methods
  generateDockerfileNode(config) {
    return `FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]`;
  }

  generateDockerfilePython(config) {
    return `FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

EXPOSE 8000

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]`;
  }

  generateDockerfileJava(config) {
    return `FROM maven:3.9-openjdk-17

WORKDIR /app
COPY pom.xml .
RUN mvn dependency:go-offline

COPY . .
RUN mvn clean package -DskipTests

EXPOSE 8080

CMD ["java", "-jar", "target/${config.projectName}-1.0.0.jar"]`;
  }

  generateDockerfileGo(config) {
    return `FROM golang:1.21-alpine AS builder

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 go build -o main .

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/main .

EXPOSE 8080

CMD ["./main"]`;
  }

  generateDockerfileRust(config) {
    return `FROM rust:1.73-alpine AS builder

WORKDIR /app
COPY Cargo.toml Cargo.lock ./
RUN mkdir src && echo "fn main() {}" > src/main.rs
RUN cargo build --release
RUN rm -rf src

COPY . .
RUN touch src/main.rs && cargo build --release

FROM alpine:latest
RUN apk --no-cache add ca-certificates
WORKDIR /app
COPY --from=builder /app/target/release/${config.projectName} .

EXPOSE 8080

CMD ["./${config.projectName}"]`;
  }

  generateDockerfilePhp(config) {
    return `FROM php:8.1-fpm-alpine

WORKDIR /app

RUN docker-php-ext-install pdo pdo_mysql

COPY . .

EXPOSE 9000

CMD ["php-fpm"]`;
  }

  generateDockerCompose(config) {
    const dbServices = {
      mongodb: `
  mongodb:
    image: mongo:7.0
    ports:
      - "27017:27017"
    volumes:
      - mongodb_data:/data/db`,
      postgresql: `
  postgres:
    image: postgres:15
    ports:
      - "5432:5432"
    environment:
      POSTGRES_DB: ${config.projectName}
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
    volumes:
      - postgres_data:/var/lib/postgresql/data`,
      mysql: `
  mysql:
    image: mysql:8.0
    ports:
      - "3306:3306"
    environment:
      MYSQL_DATABASE: ${config.projectName}
      MYSQL_USER: user
      MYSQL_PASSWORD: password
      MYSQL_ROOT_PASSWORD: rootpassword
    volumes:
      - mysql_data:/var/lib/mysql`,
      redis: `
  redis:
    image: redis:7.2-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis_data:/data`
    };

    const dbService = config.database ? dbServices[config.database] : '';

    return `version: '3.8'

services:
  api:
    build: .
    ports:
      - "3000:3000"
    depends_on:
${config.database ? `      - ${config.database}` : ''}
    environment:
      - DATABASE_URL=${config.database ? `${config.database}://localhost:27017/${config.projectName}` : ''}
      - NODE_ENV=development
    volumes:
      - .:/app
      - /app/node_modules
${dbService}

volumes:
${config.database ? `  ${config.database}_data:` : ''}`;
  }

  generateDockerignore(config) {
    return `node_modules
npm-debug.log
dist
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
coverage
.nyc_output
.DS_Store
Thumbs.db`;
  }

  async generateNodeConfig(configPath, config) {
    const configContent = `
module.exports = {
  port: process.env.PORT || 3000,
  mongodb: {
    uri: process.env.DATABASE_URL || 'mongodb://localhost:27017/${config.projectName}',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d'
  },
  cors: {
    origin: process.env.CORS_ORIGINS ? process.env.CORS_ORIGINS.split(',') : ['http://localhost:3000'],
    credentials: true
  },
  logging: {
    level: process.env.LOG_LEVEL || 'info'
  }
};`;

    await fs.writeFile(path.join(configPath, 'index.js'), configContent);
  }

  async generatePythonConfig(configPath, config) {
    const configContent = `
import os
from typing import List

class Config:
    SECRET_KEY = os.environ.get('SECRET_KEY') or 'dev-secret-key'
    DATABASE_URL = os.environ.get('DATABASE_URL') or 'sqlite:///app.db'
    SQLALCHEMY_TRACK_MODIFICATIONS = False
    CORS_ORIGINS = os.environ.get('CORS_ORIGINS', 'http://localhost:3000').split(',')
`;

    await fs.writeFile(path.join(configPath, '__init__.py'), configContent);
  }

  async generateJavaConfig(projectPath, config) {
    // Spring Boot config is already in application.properties
    const configDir = path.join(projectPath, 'src/main/java/com/openwork/config');
    await fs.ensureDir(configDir);
    
    const configContent = `package com.openwork.config;

import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

@Component
@ConfigurationProperties(prefix = "app")
public class AppConfig {
    private String name = "${config.projectName}";
    private String version = "1.0.0";
    
    // getters and setters
    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
    
    public String getVersion() { return version; }
    public void setVersion(String version) { this.version = version; }
}`;

    await fs.writeFile(path.join(configDir, 'AppConfig.java'), configContent);
  }

  async generateGoConfig(projectPath, config) {
    const configDir = path.join(projectPath, 'config');
    await fs.ensureDir(configDir);
    
    const configContent = `package config

import (
    "os"
    "fmt"
)

type Config struct {
    Port        string
    DatabaseURL string
    JWTSecret   string
    CORSOrigins []string
}

func LoadConfig() *Config {
    return &Config{
        Port:        getEnv("PORT", "8080"),
        DatabaseURL: getEnv("DATABASE_URL", "postgres://user:password@localhost/${config.projectName}?sslmode=disable"),
        JWTSecret:   getEnv("JWT_SECRET", "your-secret-key"),
        CORSOrigins: []string{getEnv("CORS_ORIGINS", "http://localhost:3000")},
    }
}

func getEnv(key, defaultValue string) string {
    if value := os.Getenv(key); value != "" {
        return value
    }
    return defaultValue
}`;

    await fs.writeFile(path.join(configDir, 'config.go'), configContent);
  }

  async generateRustConfig(projectPath, config) {
    const configDir = path.join(projectPath, 'src/config');
    await fs.ensureDir(configDir);
    
    const configContent = `use std::env;

pub struct Config {
    pub port: u16,
    pub database_url: String,
    pub jwt_secret: String,
}

impl Config {
    pub fn from_env() -> Self {
        Config {
            port: env::var("PORT")
                .unwrap_or_else(|_| "8080".to_string())
                .parse()
                .unwrap_or(8080),
            database_url: env::var("DATABASE_URL")
                .unwrap_or_else(|_| format!("sqlite://{}", "${config.projectName}")),
            jwt_secret: env::var("JWT_SECRET")
                .unwrap_or_else(|_| "your-secret-key".to_string()),
        }
    }
}`;

    await fs.writeFile(path.join(configDir, 'mod.rs'), configContent);
    await fs.writeFile(path.join(configDir, 'lib.rs'), configContent);
  }

  async generatePhpConfig(projectPath, config) {
    const configDir = path.join(projectPath, 'config');
    await fs.ensureDir(configDir);
    
    const configContent = `<?php

return [
    'name' => env('APP_NAME', '${config.projectName}'),
    'env' => env('APP_ENV', 'development'),
    'debug' => (bool) env('APP_DEBUG', true),
    'url' => env('APP_URL', 'http://localhost'),
    
    'database' => [
        'driver' => env('DB_CONNECTION', 'mysql'),
        'host' => env('DB_HOST', '127.0.0.1'),
        'port' => env('DB_PORT', '3306'),
        'database' => env('DB_DATABASE', '${config.projectName}'),
        'username' => env('DB_USERNAME', 'root'),
        'password' => env('DB_PASSWORD', ''),
    ],
    
    'cors' => [
        'paths' => ['api/*'],
        'allowed_methods' => ['*'],
        'allowed_origins' => ['*'],
        'allowed_headers' => ['*'],
    ],
];`;

    await fs.writeFile(path.join(configDir, 'app.php'), configContent);
  }

  async generateCIFiles(projectPath, config) {
    const githubDir = path.join(projectPath, '.github/workflows');
    await fs.ensureDir(githubDir);
    
    const ciContent = `name: CI/CD Pipeline

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    
    services:
      ${config.database ? this.getDatabaseService(config.database) : ''}
    
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
    
    - name: Build
      run: npm run build

  deploy:
    needs: test
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
    - name: Deploy to production
      run: echo "Deploy step would go here"`;

    await fs.writeFile(path.join(githubDir, 'ci.yml'), ciContent);
  }

  getDatabaseService(database) {
    const services = {
      mongodb: `mongodb:
        image: mongo:7.0
        ports:
          - 27017:27017
        options: >-
          --health-cmd "mongosh --eval 'db.runCommand({ping: 1})'"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5`,
      postgresql: `postgres:
        image: postgres:15
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432`,
      mysql: `mysql:
        image: mysql:8.0
        env:
          MYSQL_ROOT_PASSWORD: password
          MYSQL_DATABASE: test
        options: >-
          --health-cmd "mysqladmin ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 3306:3306`
    };
    
    return services[database] || '';
  }
}

module.exports = ProjectGenerator;