const fs = require('fs-extra');
const path = require('path');

class TechDetector {
  constructor() {
    this.techSignatures = {
      'node': {
        files: ['package.json', 'yarn.lock', 'package-lock.json'],
        extensions: ['.js', '.ts', '.mjs', '.cjs'],
        patterns: ['require\\(', 'import.*from', 'module.exports', 'export.*'],
        frameworks: {
          'express': ['express\\(\\)', 'require.*express', 'import.*express'],
          'nestjs': ['@nestjs/core', 'Controller', 'Injectable', 'Module'],
          'fastify': ['fastify\\(\\)', 'require.*fastify', 'import.*fastify'],
          'koa': ['koa\\(\\)', 'require.*koa', 'import.*koa'],
          'hapi': ['@hapi/hapi', 'server\\.route'],
          'sails': ['sails\\.lift', 'require.*sails']
        }
      },
      'python': {
        files: ['requirements.txt', 'setup.py', 'pyproject.toml', 'Pipfile', 'poetry.lock'],
        extensions: ['.py'],
        patterns: ['import ', 'from .* import', 'def ', 'class '],
        frameworks: {
          'django': ['django-admin', 'manage.py', 'DJANGO_SETTINGS_MODULE', 'from django'],
          'fastapi': ['FastAPI\\(', 'from fastapi import', 'APIRouter'],
          'flask': ['Flask\\(', 'from flask import', '@app.route'],
          'tornado': ['tornado.web', 'from tornado import', 'RequestHandler'],
          'aiohttp': ['aiohttp.web', 'from aiohttp import']
        }
      },
      'java': {
        files: ['pom.xml', 'build.gradle', 'build.gradle.kts'],
        extensions: ['.java', '.kt'],
        patterns: ['public class', 'import java\\.', 'package ', 'public static void main'],
        frameworks: {
          'spring': ['@SpringBootApplication', 'SpringApplication', '@RestController', '@Autowired'],
          'quarkus': ['@Path', '@ApplicationPath', 'Quarkus', '@GET'],
          'micronaut': ['@Controller', '@Inject', 'Micronaut', '@Get'],
          'vertx': ['Vertx', 'vertx\\.deployVerticle', '@Route']
        }
      },
      'go': {
        files: ['go.mod', 'go.sum'],
        extensions: ['.go'],
        patterns: ['package ', 'func \\(', 'import \\(', 'type.*struct'],
        frameworks: {
          'gin': ['gin\\.Default\\(', 'gin-gonic', 'gin\\.Engine'],
          'echo': ['echo\\.New\\(', 'echo framework', 'echo\\.Echo'],
          'fiber': ['fiber\\.New\\(', 'gofiber', 'fiber\\.App'],
          'chi': ['chi\\.Router\\(', 'go-chi/chi'],
          'gorilla': ['gorilla/mux', 'mux\\.NewRouter']
        }
      },
      'rust': {
        files: ['Cargo.toml', 'Cargo.lock'],
        extensions: ['.rs'],
        patterns: ['fn main\\(\\)', 'use ', 'mod ', 'pub fn'],
        frameworks: {
          'actix': ['actix_web', 'HttpServer', 'App'],
          'rocket': ['#\\[get\\(', 'rocket::', '#\\[derive'],
          'warp': ['warp::', 'Filter', 'warp::serve'],
          'axum': ['axum', 'Router', 'extract']
        }
      },
      'php': {
        files: ['composer.json', 'composer.lock'],
        extensions: ['.php'],
        patterns: ['<?php', 'namespace ', 'class ', 'function '],
        frameworks: {
          'laravel': ['laravel/framework', 'Route::', 'Illuminate'],
          'symfony': ['symfony/framework', '@Route', 'Symfony'],
          'slim': ['slim/framework', 'Slim\\App', '$app->get']
        }
      },
      'csharp': {
        files: ['project.json', '*.csproj', '*.sln'],
        extensions: ['.cs'],
        patterns: ['using ', 'namespace ', 'public class', 'public static void Main'],
        frameworks: {
          'aspnet': ['Microsoft.AspNetCore', 'ControllerBase', '[HttpGet]'],
          'nancy': ['Nancy', 'NancyModule']
        }
      }
    };

    this.databaseSignatures = {
      'mongodb': ['mongodb', 'mongoose', 'mongo-client', 'pymongo', 'mongodb-driver'],
      'postgresql': ['pg', 'postgresql', 'psycopg2', 'postgres', 'npgsql'],
      'mysql': ['mysql2', 'mysql', 'pymysql', 'sqlalchemy.*mysql', 'mysql-connector'],
      'sqlite': ['sqlite3', 'sqlite', 'better-sqlite3', 'sqlite-net'],
      'redis': ['redis', 'ioredis', 'redis-py', 'stackexchange.redis'],
      'oracle': ['oracledb', 'cx_Oracle', 'oracle-driver'],
      'sqlserver': ['mssql', 'pymssql', 'sql-server-driver']
    };
  }

  async analyzeCurrentDirectory() {
    const analysis = {
      technologies: [],
      frameworks: [],
      databases: [],
      confidence: {},
      files: [],
      packageInfo: {}
    };

    const currentDir = process.cwd();
    const files = await this.getAllFiles(currentDir);
    analysis.files = files;

    // Check for package managers and extract info
    analysis.packageInfo = await this.extractPackageInfo(currentDir);

    // Detect technologies
    for (const [tech, config] of Object.entries(this.techSignatures)) {
      const confidence = await this.detectTechnology(files, tech, config);
      if (confidence > 0.3) {
        analysis.technologies.push(tech);
        analysis.confidence[tech] = confidence;
        
        // Detect frameworks for this technology
        const detectedFrameworks = await this.detectFrameworks(files, tech, config.frameworks);
        analysis.frameworks.push(...detectedFrameworks);
      }
    }

    // Detect databases
    analysis.databases = await this.detectDatabases(files);

    return analysis;
  }

  async extractPackageInfo(dir) {
    const info = {};

    // Node.js package.json
    if (await fs.pathExists(path.join(dir, 'package.json'))) {
      try {
        info.node = await fs.readJson(path.join(dir, 'package.json'));
      } catch (e) {}
    }

    // Python requirements
    if (await fs.pathExists(path.join(dir, 'requirements.txt'))) {
      try {
        const content = await fs.readFile(path.join(dir, 'requirements.txt'), 'utf8');
        info.python = content.split('\n').filter(line => line.trim() && !line.startsWith('#'));
      } catch (e) {}
    }

    // Java pom.xml
    if (await fs.pathExists(path.join(dir, 'pom.xml'))) {
      try {
        info.java = await fs.readFile(path.join(dir, 'pom.xml'), 'utf8');
      } catch (e) {}
    }

    // Go go.mod
    if (await fs.pathExists(path.join(dir, 'go.mod'))) {
      try {
        const content = await fs.readFile(path.join(dir, 'go.mod'), 'utf8');
        const match = content.match(/module\s+(.+)/);
        if (match) info.go = { module: match[1].trim() };
      } catch (e) {}
    }

    // Rust Cargo.toml
    if (await fs.pathExists(path.join(dir, 'Cargo.toml'))) {
      try {
        info.rust = await fs.readFile(path.join(dir, 'Cargo.toml'), 'utf8');
      } catch (e) {}
    }

    return info;
  }

  async getAllFiles(dir) {
    let files = [];
    
    try {
      const items = await fs.readdir(dir);
      
      for (const item of items) {
        const fullPath = path.join(dir, item);
        const stat = await fs.stat(fullPath);
        
        if (stat.isDirectory() && !this.shouldSkipDirectory(item)) {
          files = files.concat(await this.getAllFiles(fullPath));
        } else if (stat.isFile()) {
          files.push(fullPath);
        }
      }
    } catch (error) {
      // Skip directories we can't read
    }
    
    return files;
  }

  shouldSkipDirectory(dirName) {
    const skipDirs = ['.git', 'node_modules', '__pycache__', 'target', 'vendor', '.vscode', '.idea', 'build', 'dist', '.next', '.nuxt'];
    return skipDirs.includes(dirName);
  }

  async detectTechnology(files, tech, config) {
    let score = 0;
    let maxScore = 0;

    // Check for signature files
    maxScore += config.files.length * 10;
    for (const file of config.files) {
      if (files.some(f => f.endsWith(file))) {
        score += 10;
      }
    }

    // Check file extensions
    maxScore += files.length;
    const matchingExtensions = files.filter(f => 
      config.extensions.some(ext => f.endsWith(ext))
    );
    score += matchingExtensions.length;

    // Check content patterns (sample first 10 matching files)
    const sampleFiles = matchingExtensions.slice(0, 10);
    maxScore += sampleFiles.length * config.patterns.length * 5;
    
    for (const file of sampleFiles) {
      try {
        const content = await fs.readFile(file, 'utf8');
        for (const pattern of config.patterns) {
          if (new RegExp(pattern, 'i').test(content)) {
            score += 5;
          }
        }
      } catch (error) {
        // Skip files we can't read
      }
    }

    return maxScore > 0 ? score / maxScore : 0;
  }

  async detectFrameworks(files, tech, frameworks) {
    const detected = [];
    
    for (const [framework, patterns] of Object.entries(frameworks)) {
      let confidence = 0;
      let checkedFiles = 0;
      
      for (const file of files) {
        const ext = path.extname(file);
        if (!this.techSignatures[tech].extensions.includes(ext)) continue;
        
        try {
          const content = await fs.readFile(file, 'utf8');
          for (const pattern of patterns) {
            if (new RegExp(pattern, 'i').test(content)) {
              confidence += 1;
            }
          }
          checkedFiles++;
        } catch (error) {
          // Skip files we can't read
        }
      }
      
      // Threshold detection
      if (confidence >= 2 || (confidence > 0 && checkedFiles > 0)) {
        detected.push({ 
          technology: tech, 
          framework, 
          confidence: confidence / Math.max(1, checkedFiles) 
        });
      }
    }
    
    return detected;
  }

  async detectDatabases(files) {
    const detected = {};
    
    for (const file of files) {
      try {
        const content = await fs.readFile(file, 'utf8');
        
        for (const [db, patterns] of Object.entries(this.databaseSignatures)) {
          for (const pattern of patterns) {
            if (new RegExp(pattern, 'i').test(content)) {
              detected[db] = (detected[db] || 0) + 1;
            }
          }
        }
      } catch (error) {
        // Skip files we can't read
      }
    }
    
    // Return databases sorted by detection frequency
    return Object.entries(detected)
      .sort(([,a], [,b]) => b - a)
      .map(([db]) => db);
  }

  getAvailableTechnologies() {
    return Object.keys(this.techSignatures);
  }

  getFrameworksForTechnology(tech) {
    const config = this.techSignatures[tech];
    return config ? Object.keys(config.frameworks) : [];
  }

  getAvailableDatabases() {
    return Object.keys(this.databaseSignatures);
  }

  getRecommendedTechStack() {
    return {
      'node': {
        frameworks: ['express', 'nestjs', 'fastify'],
        databases: ['mongodb', 'postgresql', 'mysql'],
        reason: 'Great for APIs, microservices, and rapid development'
      },
      'python': {
        frameworks: ['fastapi', 'django', 'flask'],
        databases: ['postgresql', 'mongodb', 'sqlite'],
        reason: 'Excellent for data processing, ML, and web applications'
      },
      'java': {
        frameworks: ['spring', 'quarkus'],
        databases: ['postgresql', 'mysql', 'oracle'],
        reason: 'Enterprise-grade, high performance, and great for large systems'
      },
      'go': {
        frameworks: ['gin', 'fiber', 'echo'],
        databases: ['postgresql', 'mongodb', 'redis'],
        reason: 'High performance, great for microservices and cloud-native'
      },
      'rust': {
        frameworks: ['actix', 'rocket'],
        databases: ['postgresql', 'sqlite'],
        reason: 'Maximum performance and memory safety'
      }
    };
  }
}

module.exports = TechDetector;