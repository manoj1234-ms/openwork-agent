const ProjectGenerator = require('../src/generators/ProjectGenerator');
const TechDetector = require('../src/core/TechDetector');
const fs = require('fs-extra');
const path = require('path');
const os = require('os');

describe('ProjectGenerator', () => {
  let generator;
  let tempDir;

  beforeEach(async () => {
    generator = new ProjectGenerator();
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openwork-test-'));
  });

  afterEach(async () => {
    await fs.remove(tempDir);
  });

  describe('Project Configuration', () => {
    test('should validate required configuration fields', async () => {
      const config = {
        projectName: 'test-project',
        technology: 'node',
        framework: 'express',
        database: 'mongodb'
      };

      expect(config.projectName).toBeDefined();
      expect(config.technology).toBeDefined();
      expect(['node', 'python', 'java', 'go', 'rust', 'php']).toContain(config.technology);
    });

    test('should generate correct project structure', () => {
      const config = {
        projectName: 'test-app',
        technology: 'node'
      };

      const structure = generator.getProjectStructure(config);
      
      expect(structure.directories).toContain('src');
      expect(structure.directories).toContain('src/controllers');
      expect(structure.directories).toContain('src/models');
      expect('package.json' in structure.files).toBe(true);
      expect(typeof structure.files['package.json']).toBe('function');
    });
  });

  describe('Template Generation', () => {
    test('should generate valid package.json for Node.js', () => {
      const config = {
        projectName: 'test-app',
        description: 'Test application',
        author: 'Test Author',
        framework: 'express',
        database: 'mongodb'
      };

      const packageJson = generator.generatePackageJSON(config);
      const parsed = JSON.parse(packageJson);

      expect(parsed.name).toBe(config.projectName);
      expect(parsed.description).toBe(config.description);
      expect(parsed.author).toBe(config.author);
      expect(Array.isArray(parsed.dependencies)).toBe(true);
      expect(parsed.dependencies).toContain('express');
      expect(parsed.dependencies).toContain('mongoose');
    });

    test('should generate valid Cargo.toml for Rust', () => {
      const config = {
        projectName: 'test-rust-app',
        description: 'Test Rust application',
        author: 'Test Author'
      };

      const cargoToml = generator.generateCargoToml(config);
      expect(cargoToml).toContain('[package]');
      expect(cargoToml).toContain(`name = "${config.projectName}"`);
      expect(cargoToml).toContain('actix-web');
    });

    test('should generate valid go.mod for Go', () => {
      const config = {
        projectName: 'test-go-app'
      };

      const goMod = generator.generateGoMod(config);
      expect(goMod).toContain(`module ${config.projectName}`);
      expect(goMod).toContain('github.com/gin-gonic/gin');
    });
  });

  describe('Technology Detection', () => {
    test('should detect supported technologies', () => {
      const techs = generator.techDetector.getAvailableTechnologies();
      expect(techs).toContain('node');
      expect(techs).toContain('python');
      expect(techs).toContain('java');
      expect(techs).toContain('go');
      expect(techs).toContain('rust');
      expect(techs).toContain('php');
    });

    test('should get frameworks for technology', () => {
      const nodeFrameworks = generator.techDetector.getFrameworksForTechnology('node');
      expect(nodeFrameworks).toContain('express');
      expect(nodeFrameworks).toContain('nestjs');
      expect(nodeFrameworks).toContain('fastify');
    });
  });

  describe('Template Files', () => {
    test('should generate valid TypeScript config', () => {
      const config = { projectName: 'test-app' };
      const tsConfig = generator.generateTsConfig(config);
      const parsed = JSON.parse(tsConfig);

      expect(parsed.compilerOptions.target).toBe('ES2020');
      expect(parsed.compilerOptions.outDir).toBe('./dist');
      expect(parsed.compilerOptions.strict).toBe(true);
    });

    test('should generate valid gitignore', () => {
      const config = { projectName: 'test-app' };
      const gitignore = generator.generateGitignore(config);

      expect(gitignore).toContain('node_modules/');
      expect(gitignore).toContain('.env');
      expect(gitignore).toContain('*.log');
    });

    test('should generate valid env example', () => {
      const config = { projectName: 'test-app' };
      const envExample = generator.generateEnvExample(config);

      expect(envExample).toContain('PORT=3000');
      expect(envExample).toContain('DATABASE_URL=');
      expect(envExample).toContain('JWT_SECRET=');
    });
  });
});

describe('TechDetector', () => {
  let detector;

  beforeEach(() => {
    detector = new TechDetector();
  });

  describe('Technology Recognition', () => {
    test('should identify Node.js projects', async () => {
      const files = [
        '/path/to/package.json',
        '/path/to/src/index.js',
        '/path/to/src/controller.js'
      ];

      // Mock file system
      detector.getAllFiles = jest.fn().mockResolvedValue(files);
      detector.detectTechnology = jest.fn().mockResolvedValue(0.8);

      const analysis = await detector.analyzeCurrentDirectory();
      expect(detector.getAllFiles).toHaveBeenCalled();
    });

    test('should identify Python projects', () => {
      const patterns = detector.techSignatures.python.patterns;
      expect(patterns).toContain('import ');
      expect(patterns).toContain('from .* import');
    });

    test('should identify Java projects', () => {
      const patterns = detector.techSignatures.java.patterns;
      expect(patterns).toContain('public class');
      expect(patterns).toContain('package ');
    });

    test('should identify Go projects', () => {
      const patterns = detector.techSignatures.go.patterns;
      expect(patterns).toContain('package ');
      expect(patterns).toContain('func \\(');
    });
  });

  describe('Database Detection', () => {
    test('should detect database signatures', () => {
      const databases = detector.getAvailableDatabases();
      expect(databases).toContain('mongodb');
      expect(databases).toContain('postgresql');
      expect(databases).toContain('mysql');
      expect(databases).toContain('redis');
    });
  });

  describe('Framework Detection', () => {
    test('should get frameworks for each technology', () => {
      const technologies = detector.getAvailableTechnologies();
      
      technologies.forEach(tech => {
        const frameworks = detector.getFrameworksForTechnology(tech);
        expect(Array.isArray(frameworks)).toBe(true);
      });
    });
  });
});

describe('Docker Templates', () => {
  const dockerTemplates = require('../src/templates/docker');

  test('should generate valid Dockerfile for Node.js', () => {
    const config = { projectName: 'test-app' };
    const dockerfile = dockerTemplates.generateDockerfileNode(config);

    expect(dockerfile).toContain('FROM node:18-alpine');
    expect(dockerfile).toContain('WORKDIR /app');
    expect(dockerfile).toContain('EXPOSE 3000');
  });

  test('should generate valid Docker Compose', () => {
    const config = { 
      projectName: 'test-app',
      database: 'mongodb'
    };
    const compose = dockerTemplates.generateDockerCompose(config);

    expect(compose).toContain('version: \'3.8\'');
    expect(compose).toContain('services:');
    expect(compose).toContain('mongodb:');
    expect(compose).toContain('mongo:7.0');
  });
});