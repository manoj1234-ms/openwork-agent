const { generateGitignore, generateEnvExample } = require('../utils/Templates');

// Update ProjectGenerator to use the new templates
const ProjectGenerator = require('./ProjectGenerator');

// Extend the ProjectGenerator with template methods
ProjectGenerator.prototype.generateGitignore = generateGitignore;
ProjectGenerator.prototype.generateEnvExample = generateEnvExample;
ProjectGenerator.prototype.generateReadme = function(config) {
  const Handlebars = require('handlebars');
  const fs = require('fs-extra');
  const path = require('path');
  
  const templatePath = path.join(__dirname, '../templates/common/README.md.hbs');
  const templateContent = fs.readFileSync(templatePath, 'utf8');
  const template = Handlebars.compile(templateContent);
  return template(config);
};

// Technology-specific configuration methods
ProjectGenerator.prototype.generateTsConfig = function(config) {
  return JSON.stringify({
    compilerOptions: {
      target: "ES2020",
      module: "commonjs",
      lib: ["ES2020"],
      outDir: "./dist",
      rootDir: "./src",
      strict: true,
      esModuleInterop: true,
      skipLibCheck: true,
      forceConsistentCasingInFileNames: true,
      resolveJsonModule: true,
      declaration: true,
      declarationMap: true,
      sourceMap: true,
      experimentalDecorators: true,
      emitDecoratorMetadata: true
    },
    include: ["src/**/*"],
    exclude: ["node_modules", "dist", "tests"]
  }, null, 2);
};

ProjectGenerator.prototype.generateNodeDevDependencies = function(config) {
  const baseDeps = [
    '@types/node',
    'typescript',
    'ts-node',
    'nodemon',
    'jest',
    '@types/jest',
    'ts-jest',
    'eslint',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/parser'
  ];

  if (config.framework === 'nestjs') {
    baseDeps.push('@nestjs/cli', '@nestjs/schematics', '@nestjs/testing');
  }

  return baseDeps;
};

// Python specific methods
ProjectGenerator.prototype.generateRequirements = function(config) {
  const requirements = [
    'fastapi==0.104.1',
    'uvicorn[standard]==0.24.0',
    'motor==3.3.2',
    'pydantic==2.5.0',
    'pydantic-settings==2.1.0',
    'python-dotenv==1.0.0',
    'python-multipart==0.0.6',
    'email-validator==2.1.0'
  ];

  if (config.database === 'postgresql') {
    requirements.push('psycopg2-binary==2.9.9');
  } else if (config.database === 'mysql') {
    requirements.push('aiomysql==0.2.0');
  } else if (config.database === 'sqlite') {
    requirements.push('aiosqlite==0.19.0');
  }

  if (config.includeTests) {
    requirements.push('pytest==7.4.3');
    requirements.push('pytest-asyncio==0.21.1');
    requirements.push('httpx==0.25.2');
  }

  return requirements.join('\n');
};

ProjectGenerator.prototype.generateSetupPy = function(config) {
  return `from setuptools import setup, find_packages

setup(
    name="${config.projectName}",
    version="1.0.0",
    description="${config.description}",
    author="${config.author}",
    packages=find_packages(),
    install_requires=[
        # Add your dependencies here
    ],
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
    python_requires=">=3.8",
)`;
};

// Java specific methods
ProjectGenerator.prototype.generatePomXML = function(config) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0"
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 
         http://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>

    <groupId>com.${config.projectName}</groupId>
    <artifactId>${config.projectName}</artifactId>
    <version>1.0.0</version>
    <packaging>jar</packaging>

    <name>${config.pascalCase(config.projectName)}</name>
    <description>${config.description}</description>

    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.0</version>
        <relativePath/>
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
            <artifactId>spring-boot-starter-data-mongodb</artifactId>
        </dependency>
        
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-validation</artifactId>
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
};

ProjectGenerator.prototype.generateApplicationProperties = function(config) {
  return `# Server Configuration
server.port=8080
spring.application.name=${config.projectName}

# Database Configuration
spring.data.mongodb.uri=mongodb://localhost:27017/${config.projectName}
spring.data.mongodb.database=${config.projectName}

# Logging Configuration
logging.level.com.${config.projectName}=DEBUG
logging.pattern.console=%d{yyyy-MM-dd HH:mm:ss} - %msg%n

# CORS Configuration
spring.web.cors.allowed-origins=http://localhost:3000
spring.web.cors.allowed-methods=GET,POST,PUT,DELETE,OPTIONS
spring.web.cors.allowed-headers=*
spring.web.cors.allow-credentials=true`;
};

// Go specific methods
ProjectGenerator.prototype.generateGoMod = function(config) {
  return `module ${config.projectName}

go 1.21

require (
    github.com/gin-gonic/gin v1.9.1
    go.mongodb.org/mongo-driver v1.12.1
    github.com/joho/godotenv v1.4.0
    github.com/google/uuid v1.3.0
)`;
};

ProjectGenerator.prototype.generateMainGo = function(config) {
  return `package main

import (
    "fmt"
    "log"
    "net/http"
    
    "github.com/gin-gonic/gin"
    "github.com/joho/godotenv"
)

func main() {
    // Load environment variables
    if err := godotenv.Load(); err != nil {
        log.Println("Warning: Could not load .env file")
    }

    // Initialize router
    r := gin.Default()
    
    // CORS middleware
    r.Use(func(c *gin.Context) {
        c.Header("Access-Control-Allow-Origin", "*")
        c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
        c.Header("Access-Control-Allow-Headers", "Content-Type, Authorization")
        
        if c.Request.Method == "OPTIONS" {
            c.AbortWithStatus(204)
            return
        }
        
        c.Next()
    })

    // Health check
    r.GET("/health", func(c *gin.Context) {
        c.JSON(http.StatusOK, gin.H{
            "status": "OK",
            "message": "${config.projectName} is running",
        })
    })

    // API routes
    api := r.Group("/api")
    {
        // TODO: Add your API routes here
        api.GET("/users", getUsers)
    }

    port := os.Getenv("PORT")
    if port == "" {
        port = "8080"
    }

    fmt.Printf("🚀 Server starting on port %s\\n", port)
    log.Fatal(http.ListenAndServe(":"+port, r))
}

func getUsers(c *gin.Context) {
    // TODO: Implement user retrieval logic
    c.JSON(http.StatusOK, gin.H{
        "success": true,
        "data": []interface{}{},
    })
}`;
};

// Rust specific methods
ProjectGenerator.prototype.generateCargoToml = function(config) {
  return `[package]
name = "${config.projectName}"
version = "0.1.0"
edition = "2021"
authors = ["${config.author}"]
description = "${config.description}"

[dependencies]
actix-web = "4.4"
actix-cors = "0.7"
serde = { version = "1.0", features = ["derive"] }
serde_json = "1.0"
diesel = { version = "2.1", features = ["postgres", "r2d2"] }
diesel_migrations = "2.1"
dotenv = "0.15"
log = "0.4"
env_logger = "0.10"
uuid = { version = "1.5", features = ["v4", "serde"] }
chrono = { version = "0.4", features = ["serde"] }
anyhow = "1.0"
thiserror = "1.0"`;
};

ProjectGenerator.prototype.generateMainRs = function(config) {
  return `use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use std::env;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    env_logger::init();
    dotenv::dotenv().ok();

    HttpServer::new(|| {
        let cors = Cors::default()
            .allow_any_origin()
            .allow_any_method()
            .allow_any_header()
            .max_age(3600);

        App::new()
            .wrap(cors)
            .wrap(Logger::default())
            .route("/health", web::get().to(health_check))
            .service(
                web::scope("/api")
                    // TODO: Add your API routes here
                    .route("/users", web::get().to(get_users))
            )
    })
    .bind("0.0.0.0:8080")?
    .run()
    .await
}

async fn health_check() -> impl actix_web::Responder {
    actix_web::HttpResponse::Ok().json(serde_json::json!({
        "status": "OK",
        "message": "${config.pascalCase(config.projectName)} is running"
    }))
}

async fn get_users() -> impl actix_web::Responder {
    // TODO: Implement user retrieval logic
    actix_web::HttpResponse::Ok().json(serde_json::json!({
        "success": true,
        "data": []
    }))
}`;
};

// PHP specific methods
ProjectGenerator.prototype.generateComposerJSON = function(config) {
  return JSON.stringify({
    name: `${config.author}/${config.projectName}`,
    description: config.description,
    type: "project",
    require: {
      php: "^7.4|^8.0",
      "illuminate/database": "^10.0",
      "illuminate/routing": "^10.0",
      "illuminate/http": "^10.0",
      "illuminate/validation": "^10.0",
      "vlucas/phpdotenv": "^5.4"
    },
    requireDev: {
      "phpunit/phpunit": "^9.0",
      "squizlabs/php_codesniffer": "^3.7"
    },
    autoload: {
      psr4: {
        "App\\": "app/"
      }
    },
    scripts: {
      "start": "php -S localhost:8000 -t public",
      "test": "phpunit"
    },
    authors: [
      {
        name: config.author
      }
    ],
    minimumStability: "stable"
  }, null, 2);
};

// Helper method for PascalCase
ProjectGenerator.prototype.pascalCase = function(str) {
  return str.replace(/(?:^\w|[A-Z]|\b\w)/g, (word, index) => {
    return word.toUpperCase();
  }).replace(/\s+/g, '');
};

// Helper method for snakeCase
ProjectGenerator.prototype.snakeCase = function(str) {
  return str.replace(/([a-z])([A-Z])/g, '$1_$2').replace(/\s+/g, '_').toLowerCase();
};

module.exports = ProjectGenerator;